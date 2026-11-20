"""Regression checks for preserving and refreshing the public Credly feed."""

import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
BADGE_ID = "12345678-1234-4321-8321-123456789abc"
OTHER_ID = "12345678-1234-4321-8321-123456789def"
IMAGE_ID = "87654321-4321-1234-8321-cba987654321"
FIRST_URL = "https://www.credly.com/users/sunil-sarolkar/badges?page=1&page_size=48&sort=rank"
NEXT_URL = "https://www.credly.com/users/sunil-sarolkar/badges?page=2&page_size=48&sort=rank"
PAYLOAD = {
    "data": [{
        "id": BADGE_ID,
        "badge_template": {"name": "A newly earned badge"},
        "issuer": {"entities": [{"primary": False, "entity": {"name": "Another issuer"}}, {"primary": True, "entity": {"name": "Google Cloud"}}]},
        "image_url": f"https://images.credly.com/images/{IMAGE_ID}/blob",
        "issued_at_date": "2026-11-19",
        "expires_at_date": "2027-11-19",
        "public": True,
        "state": "accepted",
    }],
    "metadata": {"count": 1, "current_page": 1, "total_count": 1, "total_pages": 1, "next_page_url": None},
}


def program():
    spec = importlib.util.spec_from_file_location("credly_fetcher", ROOT / "fetch_credly_badges.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def pages():
    first = copy.deepcopy(PAYLOAD)
    first["metadata"].update(total_count=2, total_pages=2, next_page_url=NEXT_URL)
    second = copy.deepcopy(PAYLOAD)
    second["data"][0].update(id=OTHER_ID)
    second["metadata"].update(current_page=2, total_count=2, total_pages=2)
    return first, second


class CredlyFeedTests(unittest.TestCase):
    def setUp(self):
        self.fetcher = program()
        self.existing = json.loads((ROOT / "_data/credly_badges.json").read_text())
        self.curated = json.loads((ROOT / "_data/certifications.json").read_text())

    def test_public_credential_id_is_used_instead_of_different_image_id(self):
        records = self.fetcher.parse_badges(PAYLOAD)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["uuid"], BADGE_ID)
        self.assertEqual(records[0]["url"], f"https://www.credly.com/badges/{BADGE_ID}")
        self.assertEqual(records[0]["issuer"], "Google Cloud")
        self.assertEqual(records[0]["image340"], f"https://images.credly.com/size/340x340/images/{IMAGE_ID}/blob")
        self.assertEqual(records[0]["issued"], "2026-11-19")
        self.assertEqual(records[0]["issuedLabel"], "19 November 2026")
        self.assertEqual(records[0]["expiresLabel"], "19 November 2027")

    def test_missing_credential_id_never_falls_back_to_image_id(self):
        payload = copy.deepcopy(PAYLOAD)
        del payload["data"][0]["id"]
        with self.assertRaises(ValueError):
            self.fetcher.parse_badges(payload)

    def test_empty_or_invalid_feed_leaves_saved_collection_byte_identical(self):
        invalid_image = copy.deepcopy(PAYLOAD)
        invalid_image["data"][0]["image_url"] = "javascript:alert(1)"
        for payload in [{}, {"data": []}, invalid_image]:
            with self.subTest(payload=payload), tempfile.TemporaryDirectory() as directory:
                output = Path(directory) / "badges.json"
                original = (ROOT / "_data/credly_badges.json").read_bytes()
                output.write_bytes(original)
                with patch.object(self.fetcher, "read_public_page", return_value=payload), self.assertRaises(ValueError):
                    self.fetcher.refresh_from_credly("sunil-sarolkar", output, ROOT / "_data/certifications.json")
                self.assertEqual(output.read_bytes(), original)

    def test_partial_collection_adds_new_badge_without_dropping_known_twenty(self):
        merged = self.fetcher.merge_badges(self.existing, self.fetcher.parse_badges(PAYLOAD), self.curated)
        self.assertEqual(len(merged), 21)
        self.assertTrue({record["uuid"] for record in self.existing} <= {record["uuid"] for record in merged})

    def test_empty_or_bad_record_cannot_replace_the_saved_collection(self):
        for fetched in [[], [{"name": "Missing credential metadata"}]]:
            with self.subTest(fetched=fetched), self.assertRaises(ValueError):
                self.fetcher.merge_badges(self.existing, fetched, self.curated)

    def test_curated_certification_art_dates_and_credential_ids_survive_refresh(self):
        changed = dict(self.existing[-1], image=f"https://images.credly.com/images/{IMAGE_ID}/blob", image340="", issued="", expires="")
        merged = self.fetcher.merge_badges(self.existing, [changed], self.curated)
        associate = next(record for record in merged if record["uuid"] == "65582184-f59c-49e8-bf95-383c3ae1168d")
        self.assertEqual(associate["url"], "https://www.credly.com/badges/65582184-f59c-49e8-bf95-383c3ae1168d/public_url")
        self.assertEqual(associate["image"], "/assets/badges/gcp-associate-cloud-engineer.png")
        self.assertEqual(associate["image340"], "/assets/badges/gcp-associate-cloud-engineer.png")
        self.assertEqual(associate["issued"], "2023-04-09")
        self.assertEqual(associate["expires"], "2029-04-09")
        self.assertNotIn("97997fd6-bd29-4f49-8e39-4741f3ca0719", {record["uuid"] for record in merged})

    def test_duplicate_and_reordered_feeds_have_stable_output(self):
        fetched = self.fetcher.parse_badges(PAYLOAD)
        first = self.fetcher.merge_badges(self.existing, fetched + self.existing[:2] + fetched, self.curated)
        second = self.fetcher.merge_badges(first, list(reversed(fetched + self.existing[:2])), self.curated)
        self.assertEqual(first, second)
        self.assertEqual(len(first), 21)

    def test_successful_refresh_is_valid_json_and_repeat_does_not_rewrite(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "badges.json"
            output.write_bytes((ROOT / "_data/credly_badges.json").read_bytes())
            fetched = self.fetcher.parse_badges(PAYLOAD)
            self.assertTrue(self.fetcher.refresh_badges(fetched, output, ROOT / "_data/certifications.json"))
            self.assertEqual(len(json.loads(output.read_text())), 21)
            first = output.read_bytes(), output.stat().st_mtime_ns
            self.assertFalse(self.fetcher.refresh_badges(fetched, output, ROOT / "_data/certifications.json"))
            self.assertEqual((output.read_bytes(), output.stat().st_mtime_ns), first)
            self.assertEqual(sorted(path.name for path in output.parent.iterdir()), ["badges.json"])

    def test_all_public_pages_are_loaded_before_the_collection_is_returned(self):
        first, second = pages()
        responses = {FIRST_URL: first, NEXT_URL: second}
        with patch.object(self.fetcher, "read_public_page", side_effect=lambda url: responses[url]):
            records = self.fetcher.fetch_badges("sunil-sarolkar")
        self.assertEqual([record["uuid"] for record in records], [BADGE_ID, OTHER_ID])

    def test_mid_pagination_failure_does_not_write_partial_data(self):
        first, _ = pages()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "badges.json"
            original = (ROOT / "_data/credly_badges.json").read_bytes()
            output.write_bytes(original)
            receipt = output.parent / "credly_sync.json"
            previous_receipt = b'{"checked_at":"2026-11-01T00:00:00Z"}\n'
            receipt.write_bytes(previous_receipt)
            with patch.object(self.fetcher, "read_public_page", side_effect=[first, OSError("connection interrupted")]), self.assertRaises(OSError):
                self.fetcher.refresh_from_credly("sunil-sarolkar", output, ROOT / "_data/certifications.json")
            self.assertEqual(output.read_bytes(), original)
            self.assertEqual(receipt.read_bytes(), previous_receipt)

    def test_successful_complete_refresh_records_actual_counts_and_utc_check(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "badges.json"
            output.write_bytes((ROOT / "_data/credly_badges.json").read_bytes())
            with patch.object(self.fetcher, "read_public_page", return_value=PAYLOAD):
                self.fetcher.refresh_from_credly("sunil-sarolkar", output, ROOT / "_data/certifications.json")
            receipt = json.loads((output.parent / "credly_sync.json").read_text())
            self.assertEqual(receipt["public_badges"], 1)
            self.assertEqual(receipt["retained_badges"], 21)
            self.assertEqual(receipt["source_url"], "https://www.credly.com/users/sunil-sarolkar/badges")
            self.assertRegex(receipt["checked_at"], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")

    def test_pagination_cannot_leave_the_public_origin_and_profile(self):
        for invalid in ["https://example.com/badges", "https://www.credly.com/users/another-person/badges?page=2", "https://www.credly.com/api/private", "http://www.credly.com/users/sunil-sarolkar/badges?page=2"]:
            first, _ = pages()
            first["metadata"]["next_page_url"] = invalid
            with self.subTest(invalid=invalid), patch.object(self.fetcher, "read_public_page", side_effect=[first, AssertionError("invalid next URL was requested")]), self.assertRaises(ValueError):
                self.fetcher.fetch_badges("sunil-sarolkar")

    def test_incomplete_or_repeated_pagination_is_rejected(self):
        first, _ = pages()
        first["metadata"]["next_page_url"] = None
        repeated, _ = pages()
        repeated["metadata"]["next_page_url"] = FIRST_URL
        for payload in [first, repeated]:
            with self.subTest(payload=payload), patch.object(self.fetcher, "read_public_page", return_value=payload), self.assertRaises(ValueError):
                self.fetcher.fetch_badges("sunil-sarolkar")


if __name__ == "__main__":
    unittest.main()
