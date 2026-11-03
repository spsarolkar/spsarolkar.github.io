#!/usr/bin/env python3
"""Check local HTML links and media against a generated Jekyll site."""

import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


def srcset_urls(value):
    """Read URL tokens without splitting commas inside data URLs."""
    position = 0
    while position < len(value):
        while position < len(value) and (value[position].isspace() or value[position] == ","):
            position += 1
        start = position
        while position < len(value) and not value[position].isspace():
            position += 1
        url = value[start:position]
        if not url:
            break
        yield url.rstrip(",")
        if not url.endswith(","):
            while position < len(value) and value[position] != ",":
                position += 1


class LocalLinks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []

    def handle_starttag(self, tag, attributes):
        for attribute, value in attributes:
            if value is None:
                continue
            if attribute in ("href", "src", "poster"):
                self.links.append((self.getpos()[0], attribute, value))
            elif attribute == "srcset":
                self.links.extend((self.getpos()[0], attribute, url) for url in srcset_urls(value))


def main():
    arguments = argparse.ArgumentParser(description=__doc__)
    arguments.add_argument("site", nargs="?", default="_site", type=Path, help="generated site directory (default: _site)")
    site = arguments.parse_args().site.resolve()
    if not site.is_dir():
        arguments.error(f"generated site directory does not exist: {site}")
    pages = sorted(site.rglob("*.html"))
    if not pages:
        arguments.error(f"generated site contains no HTML files: {site}")

    failures = []
    checked = 0
    for page in pages:
        relative = page.relative_to(site).as_posix()
        page_url = "/" + (relative.removesuffix("index.html") if page.name == "index.html" else relative)
        parser = LocalLinks()
        parser.feed(page.read_text(encoding="utf-8"))
        for line, attribute, value in parser.links:
            value = value.strip()
            if not value or value.startswith("#"):
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc:
                continue
            target_url = urlsplit(urljoin(page_url, value)).path
            target = (site / unquote(target_url).lstrip("/")).resolve()
            checked += 1
            if target.is_relative_to(site) and (target.is_file() or (target / "index.html").is_file()):
                continue
            failures.append(f"{relative}:{line}: {attribute}={value!r} -> {target_url}")

    if failures:
        print(f"Broken local references: {len(failures)}")
        for failure in failures:
            print(f"  {failure}")
        return 1
    print(f"Site link checks passed: {checked} local references across {len(pages)} HTML files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
