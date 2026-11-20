"""Refresh badges from the same public JSON feed used by Credly's profile page."""

from datetime import date, datetime, timezone
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from uuid import UUID


ROOT = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT / "_data/credly_badges.json"
CERTIFICATIONS_FILE = ROOT / "_data/certifications.json"
ORIGIN = "https://www.credly.com"
MAX_PAGES = 20
MONTHS = ("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")


def credential_id(url):
    parsed = urlsplit(urljoin(ORIGIN, url or ""))
    match = re.fullmatch(r"/badges/([0-9a-fA-F-]{36})(?:/public_url)?/?", parsed.path)
    if parsed.scheme != "https" or parsed.hostname not in ("credly.com", "www.credly.com") or not match:
        raise ValueError("Badge has no valid public Credly credential link")
    return str(UUID(match.group(1)))


def validate_badge(record):
    if not isinstance(record, dict) or not all(isinstance(record.get(key), str) and record[key].strip() for key in ("name", "issuer", "image", "url", "uuid")):
        raise ValueError("Incomplete badge metadata; keeping the existing collection")
    if credential_id(record["url"]) != record["uuid"]:
        raise ValueError("Badge ID does not match its public credential link")
    image = urlsplit(record["image"])
    if not (record["image"].startswith("/assets/") and not image.netloc) and not (image.scheme == "https" and image.hostname == "images.credly.com"):
        raise ValueError("Badge image is not a public Credly image or a retained local asset")


def date_fields(value):
    if value is None or value == "":
        return "", ""
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        raise ValueError("Credly returned an invalid credential date")
    parsed = date.fromisoformat(value)
    return value, f"{parsed.day} {MONTHS[parsed.month - 1]} {parsed.year}"


def parse_badges(payload):
    if not isinstance(payload, dict) or not isinstance(payload.get("data"), list) or not payload["data"]:
        raise ValueError("Credly returned no valid public badges; keeping the existing collection")
    records = []
    for raw in payload["data"]:
        try:
            badge_id = str(UUID(raw["id"]))
            name = raw["badge_template"]["name"]
            entities = raw["issuer"]["entities"]
            issuer = next(entity["entity"]["name"] for entity in entities if entity.get("primary") is True)
            image_url = raw["image_url"]
            issued, issued_label = date_fields(raw.get("issued_at_date"))
            expires, expires_label = date_fields(raw.get("expires_at_date"))
        except (KeyError, TypeError, AttributeError, StopIteration) as error:
            raise ValueError("Credly returned incomplete credential metadata") from error
        parsed_image = urlsplit(image_url)
        sized_path = re.sub(r"/(?:size/[^/]+/)?images/", "/size/340x340/images/", parsed_image.path, count=1)
        record = {
            "name": name, "issuer": issuer, "image": image_url, "uuid": badge_id,
            "url": f"{ORIGIN}/badges/{badge_id}", "issued": issued,
            "image340": urlunsplit(parsed_image._replace(path=sized_path)),
        }
        if issued_label:
            record["issuedLabel"] = issued_label
        if expires:
            record.update(expires=expires, expiresLabel=expires_label)
        validate_badge(record)
        records.append(record)
    return records


def profile_url(username):
    if not re.fullmatch(r"[a-zA-Z0-9-]+", username):
        raise ValueError("Invalid Credly username")
    return f"{ORIGIN}/users/{username}/badges"


def validate_page_url(url, username):
    absolute = urljoin(ORIGIN, url)
    parsed = urlsplit(absolute)
    if parsed.scheme != "https" or parsed.netloc != "www.credly.com" or parsed.path != urlsplit(profile_url(username)).path or parsed.fragment:
        raise ValueError("Credly pagination left the expected public profile")
    return absolute


def read_public_page(url):
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=25) as response:
        final = urlsplit(response.geturl())
        expected = urlsplit(url)
        if (final.scheme, final.netloc, final.path) != (expected.scheme, expected.netloc, expected.path):
            raise ValueError("Credly redirected away from the public badge feed")
        body = response.read(2_000_001)
        if len(body) > 2_000_000:
            raise ValueError("Credly badge response is unexpectedly large")
        return json.loads(body)


def fetch_badges(username):
    url = profile_url(username) + "?page=1&page_size=48&sort=rank"
    seen, records = set(), {}
    total, pages = None, None
    for number in range(1, MAX_PAGES + 1):
        url = validate_page_url(url, username)
        if url in seen:
            raise ValueError("Credly returned repeated pagination")
        seen.add(url)
        payload = read_public_page(url)
        current = parse_badges(payload)
        metadata = payload.get("metadata")
        if not isinstance(metadata, dict) or any(type(metadata.get(key)) is not int for key in ("count", "current_page", "total_count", "total_pages")):
            raise ValueError("Credly returned incomplete pagination metadata")
        if total is None:
            total, pages = metadata["total_count"], metadata["total_pages"]
        if not (0 < pages <= MAX_PAGES and total > 0 and metadata["current_page"] == number and metadata["count"] == len(current) and metadata["total_count"] == total and metadata["total_pages"] == pages):
            raise ValueError("Credly pagination changed or is incomplete")
        records.update((record["uuid"], record) for record in current)
        following = metadata.get("next_page_url")
        if following is None:
            if number != pages or len(records) != total:
                raise ValueError("Credly did not return the complete public collection")
            return list(records.values())
        if not isinstance(following, str) or not following or number >= pages:
            raise ValueError("Credly returned invalid pagination")
        url = validate_page_url(following, username)
    raise ValueError("Credly exceeded the public pagination limit")


def merge_badges(existing, fetched, certifications):
    if not isinstance(existing, list) or not isinstance(fetched, list) or not fetched:
        raise ValueError("Empty or invalid refresh; keeping the existing collection")
    records = {}
    for record in existing + fetched:
        validate_badge(record)
    for record in existing:
        records[record["uuid"]] = dict(record)
    # Preserve known records when a previously public credential is absent.
    for record in sorted(fetched, key=lambda badge: (badge["name"].casefold(), badge["uuid"])):
        previous = records.get(record["uuid"], {})
        records[record["uuid"]] = {**previous, **{key: value for key, value in record.items() if value not in (None, "")}}
    # Verified certification records own their exact artwork and dates.
    for certification in certifications:
        badge_id = credential_id(certification["url"])
        previous = records.get(badge_id, {})
        record = {
            **previous,
            "name": previous.get("name") or f"Google Cloud Certified - {certification['title']}",
            "issuer": previous.get("issuer") or "Google Cloud",
            "uuid": badge_id, "url": certification["url"],
            "image": certification["image"], "image340": certification["image"],
            **{key: certification[key] for key in ("issued", "issuedLabel", "expires", "expiresLabel") if certification.get(key)},
        }
        validate_badge(record)
        records[badge_id] = record
    return list(records.values())


def write_json_atomic(output, data):
    output = Path(output)
    content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if output.exists() and output.read_text() == content:
        return False
    temporary = None
    try:
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=output.parent, prefix=".credly-", delete=False) as stream:
            temporary = stream.name
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, output)
    finally:
        if temporary and os.path.exists(temporary):
            os.unlink(temporary)
    return True


def refresh_badges(fetched, output=OUTPUT_FILE, certifications_file=CERTIFICATIONS_FILE):
    output = Path(output)
    merged = merge_badges(json.loads(output.read_text()), fetched, json.loads(Path(certifications_file).read_text()))
    return write_json_atomic(output, merged)


def refresh_from_credly(username, output=OUTPUT_FILE, certifications_file=CERTIFICATIONS_FILE):
    output = Path(output)
    fetched = fetch_badges(username)
    changed = refresh_badges(fetched, output, certifications_file)
    write_json_atomic(output.parent / "credly_sync.json", {
        "checked_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "public_badges": len(fetched),
        "retained_badges": len(json.loads(output.read_text())),
        "source_url": profile_url(username),
    })
    return changed


def main():
    username = os.environ.get("CREDLY_USERNAME", "sunil-sarolkar")
    changed = refresh_from_credly(username)
    total = len(json.loads(OUTPUT_FILE.read_text()))
    print(f"Credly refresh complete: {total} retained badges; {'updated' if changed else 'unchanged'} feed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Credly refresh failed; existing feed retained: {error}", file=sys.stderr)
        raise SystemExit(1)
