"""Refresh the public Credly feed without discarding previously earned badges."""

from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
from urllib.parse import urljoin, urlsplit, urlunsplit
from uuid import UUID


ROOT = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT / "_data/credly_badges.json"
CERTIFICATIONS_FILE = ROOT / "_data/certifications.json"


class BadgePage(HTMLParser):
    """Keep the card/anchor relationship so image IDs cannot become credentials."""

    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.cards = []
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        node = {"tag": tag, "attributes": dict(attributes), "parent": self.stack[-1] if self.stack else None, "children": []}
        if self.stack:
            self.stack[-1]["children"].append(node)
        if node["attributes"].get("data-testid") in ("desktop-badge-card", "mobile-badge-card"):
            self.cards.append(node)
        if tag not in ("area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"):
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]["tag"] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if self.stack:
            self.stack[-1]["children"].append(data)


def descendants(node):
    for child in node["children"]:
        if isinstance(child, dict):
            yield child
            yield from descendants(child)


def text_content(node):
    return " ".join(" ".join(text_content(child) if isinstance(child, dict) else child for child in node["children"]).split())


def credential_id(url):
    parsed = urlsplit(urljoin("https://www.credly.com", url or ""))
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


def parse_badges(html):
    cards = BadgePage(html).cards
    if not cards:
        raise ValueError("Credly returned no badge cards; keeping the existing collection")
    records = {}
    for card in cards:
        children = list(descendants(card))
        image = next((node for node in children if node["tag"] == "img"), None)
        spans = [text_content(node) for node in children if node["tag"] == "span" and not any(child["tag"] == "span" for child in descendants(node))]
        anchor = card
        while anchor is not None and anchor["tag"] != "a":
            anchor = anchor["parent"]
        if anchor is None:
            anchor = next((node for node in children if node["tag"] == "a" and "/badges/" in node["attributes"].get("href", "")), None)
        badge_id = credential_id(anchor["attributes"].get("href") if anchor else None)
        if image is None or len(spans) < 2:
            raise ValueError("Credly badge card is incomplete; keeping the existing collection")
        image_url = image["attributes"].get("src") or image["attributes"].get("data-src", "")
        parsed_image = urlsplit(image_url)
        sized_path = re.sub(r"/(?:size/[^/]+/)?images/", "/size/340x340/images/", parsed_image.path, count=1)
        record = {
            "name": spans[0],
            "issuer": spans[1],
            "image": image_url,
            "uuid": badge_id,
            "url": f"https://www.credly.com/badges/{badge_id}",
            "issued": next((text.removeprefix("Issued ").strip() for text in spans[2:] if text.startswith("Issued ")), ""),
            "image340": urlunsplit(parsed_image._replace(path=sized_path)),
        }
        validate_badge(record)
        records[badge_id] = record
    return list(records.values())


def merge_badges(existing, fetched, certifications):
    if not isinstance(existing, list) or not isinstance(fetched, list) or not fetched:
        raise ValueError("Empty or invalid refresh; keeping the existing collection")
    records = {}
    for record in existing:
        validate_badge(record)
        records[record["uuid"]] = dict(record)
    # Preserve known records when Credly only renders part of a profile.
    for record in sorted(fetched, key=lambda badge: (str(badge.get("name", "")).casefold(), str(badge.get("uuid", "")))):
        validate_badge(record)
        previous = records.get(record["uuid"], {})
        records[record["uuid"]] = {**previous, **{key: value for key, value in record.items() if value not in (None, "")}}
    # The verified certification records own their exact artwork and dates.
    for certification in certifications:
        badge_id = credential_id(certification["url"])
        previous = records.get(badge_id, {})
        record = {
            **previous,
            "name": previous.get("name") or f"Google Cloud Certified - {certification['title']}",
            "issuer": previous.get("issuer") or "Google Cloud",
            "uuid": badge_id,
            "url": certification["url"],
            "image": certification["image"],
            "image340": certification["image"],
            **{key: certification[key] for key in ("issued", "issuedLabel", "expires", "expiresLabel") if certification.get(key)},
        }
        validate_badge(record)
        records[badge_id] = record
    return list(records.values())


def refresh_badges(html, output=OUTPUT_FILE, certifications_file=CERTIFICATIONS_FILE):
    output = Path(output)
    fetched = parse_badges(html)
    merged = merge_badges(json.loads(output.read_text()), fetched, json.loads(Path(certifications_file).read_text()))
    content = json.dumps(merged, ensure_ascii=False, indent=2) + "\n"
    if output.read_text() == content:
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


def fetch_html(username):
    # Selenium Manager uses the runner's installed Chrome and matching driver.
    from selenium import webdriver
    from selenium.webdriver.support.wait import WebDriverWait

    if not re.fullmatch(r"[a-zA-Z0-9-]+", username):
        raise ValueError("Invalid Credly username")
    options = webdriver.ChromeOptions()
    chrome = shutil.which("google-chrome") or shutil.which("google-chrome-stable")
    if chrome:
        options.binary_location = chrome
    for argument in ("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,1200"):
        options.add_argument(argument)
    driver = webdriver.Chrome(options=options)
    try:
        driver.set_page_load_timeout(60)
        driver.get(f"https://www.credly.com/users/{username}")

        def loaded(browser):
            try:
                return parse_badges(browser.page_source)
            except ValueError:
                return False

        WebDriverWait(driver, 45).until(loaded, "Public Credly badge cards did not become available")
        return driver.page_source
    finally:
        driver.quit()


def main():
    username = os.environ.get("CREDLY_USERNAME", "sunil-sarolkar")
    changed = refresh_badges(fetch_html(username))
    total = len(json.loads(OUTPUT_FILE.read_text()))
    print(f"Credly refresh complete: {total} retained badges; {'updated' if changed else 'unchanged'} feed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Credly refresh failed; existing feed retained: {error}", file=sys.stderr)
        raise SystemExit(1)
