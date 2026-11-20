"""Regression checks for preserving and refreshing the public Credly feed."""

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
BADGE_ID = "12345678-1234-4321-8321-123456789abc"
IMAGE_ID = "87654321-4321-1234-8321-cba987654321"
CARD = f"""<a href="/badges/{BADGE_ID}/public_url">
<div data-testid="desktop-badge-card">
<img alt="A newly earned badge" src="https://images.credly.com/images/{IMAGE_ID}/blob">
<span>A newly earned badge</span><span>Google Cloud</span><span>Issued November 19, 2026</span>
</div></a>"""


def program():
    spec = importlib.util.spec_from_file_location("credly_fetcher", ROOT / "fetch_credly_badges.py")
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
    except ModuleNotFoundError as error:
        raise AssertionError("Offline feed parsing must not require browser dependencies or launch Chrome") from error
    return module


class CredlyFeedTests(unittest.TestCase):
    def setUp(self):
        self.fetcher = program()
        self.existing = json.loads((ROOT / "_data/credly_badges.json").read_text())
        self.curated = json.loads((ROOT / "_data/certifications.json").read_text())

    def test_credential_link_id_is_used_instead_of_different_image_id(self):
        records = self.fetcher.parse_badges(CARD)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["uuid"], BADGE_ID)
        self.assertEqual(records[0]["url"], f"https://www.credly.com/badges/{BADGE_ID}")
        self.assertEqual(records[0]["issued"], "November 19, 2026")
        self.assertEqual(records[0]["image340"], f"https://images.credly.com/size/340x340/images/{IMAGE_ID}/blob")

    def test_anchor_inside_card_is_also_resolved(self):
        nested = CARD.replace(f'<a href="/badges/{BADGE_ID}/public_url">\n<div data-testid="desktop-badge-card">',
                              f'<div data-testid="desktop-badge-card"><a href="/badges/{BADGE_ID}">').replace('</div></a>', '</a></div>')
        self.assertEqual(self.fetcher.parse_badges(nested)[0]["uuid"], BADGE_ID)

    def test_no_credential_link_never_falls_back_to_image_id(self):
        with self.assertRaises(ValueError):
            self.fetcher.parse_badges(CARD.replace(f'/badges/{BADGE_ID}/public_url', '/users/example'))

    def test_empty_or_invalid_scrape_leaves_saved_collection_byte_identical(self):
        for html in ["<html>Temporarily unavailable</html>", CARD.replace('https://images.credly.com', 'javascript:')]:
            with self.subTest(html=html), tempfile.TemporaryDirectory() as directory:
                output = Path(directory) / "badges.json"
                original = (ROOT / "_data/credly_badges.json").read_bytes()
                output.write_bytes(original)
                with self.assertRaises(ValueError):
                    self.fetcher.refresh_badges(html, output, ROOT / "_data/certifications.json")
                self.assertEqual(output.read_bytes(), original)

    def test_partial_scrape_adds_new_badge_without_dropping_known_twenty(self):
        merged = self.fetcher.merge_badges(self.existing, self.fetcher.parse_badges(CARD), self.curated)
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

    def test_duplicate_and_reordered_scrapes_have_stable_output(self):
        fetched = self.fetcher.parse_badges(CARD)
        first = self.fetcher.merge_badges(self.existing, fetched + self.existing[:2] + fetched, self.curated)
        second = self.fetcher.merge_badges(first, list(reversed(fetched + self.existing[:2])), self.curated)
        self.assertEqual(first, second)
        self.assertEqual(len(first), 21)

    def test_successful_refresh_is_valid_json_and_repeat_does_not_rewrite(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "badges.json"
            output.write_bytes((ROOT / "_data/credly_badges.json").read_bytes())
            self.assertTrue(self.fetcher.refresh_badges(CARD, output, ROOT / "_data/certifications.json"))
            self.assertEqual(len(json.loads(output.read_text())), 21)
            first = output.read_bytes(), output.stat().st_mtime_ns
            self.assertFalse(self.fetcher.refresh_badges(CARD, output, ROOT / "_data/certifications.json"))
            self.assertEqual((output.read_bytes(), output.stat().st_mtime_ns), first)
            self.assertEqual(sorted(path.name for path in output.parent.iterdir()), ["badges.json"])


if __name__ == "__main__":
    unittest.main()
