"""Validate Hugo's rendered site using only the Python standard library.

Run after a production build:
    python scripts/verify_site.py public
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import argparse
import json
import sys
import xml.etree.ElementTree as ET

BASE = "https://theophiluse.xiitechnologies.com/"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs, self.errors = path, set(), [], []
        self.h1, self.canonical, self.descriptions = 0, [], 0
        self.alias, self.schema, self.capture = False, [], None
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids:
                self.errors.append("duplicate id: " + a["id"])
            self.ids.add(a["id"])
        if tag == "h1":
            self.h1 += 1
        if tag == "meta":
            self.alias |= a.get("http-equiv", "").lower() == "refresh"
            self.descriptions += a.get("name") == "description"
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href", ""))
        if tag == "img" and "alt" not in a:
            self.errors.append("image missing alt: " + a.get("src", ""))
        if tag == "script" and a.get("type") == "application/ld+json":
            self.capture = ""
        for key in ("href", "src", "poster"):
            if key in a:
                self.refs.append(a[key])
        if "srcset" in a:
            self.refs.extend(part.strip().split(" ")[0] for part in a["srcset"].split(","))

    def handle_data(self, data):
        if self.capture is not None:
            self.capture += data

    def handle_endtag(self, tag):
        if tag == "script" and self.capture is not None:
            try:
                self.schema.append(json.loads(self.capture))
            except json.JSONDecodeError:
                self.errors.append("invalid JSON-LD")
            self.capture = None


def verify(root):
    root = root.resolve()
    pages = {p: Page(p) for p in root.rglob("*.html")}
    failures = []
    references = 0
    for path, page in pages.items():
        if page.alias:
            continue
        relative = path.relative_to(root).as_posix()
        source_url = BASE + (relative[:-10] if relative.endswith("index.html") else relative)
        errors = list(page.errors)
        if page.h1 != 1:
            errors.append(f"expected one h1, found {page.h1}")
        if len(page.canonical) != 1 or not page.canonical[0].startswith(BASE):
            errors.append("expected one absolute production canonical")
        if page.descriptions != 1:
            errors.append("expected one meta description")
        if not page.schema:
            errors.append("missing structured data")
        for ref in page.refs:
            if not ref or ref.startswith(("data:", "mailto:", "tel:", "javascript:")):
                continue
            target = urlsplit(urljoin(source_url, ref))
            if target.netloc != urlsplit(BASE).netloc:
                continue
            references += 1
            target_path = root / unquote(target.path).lstrip("/")
            if target_path.is_dir():
                target_path /= "index.html"
            if not target_path.is_file():
                errors.append("missing local target: " + ref)
            elif target.fragment and target_path.suffix == ".html":
                destination = pages.get(target_path)
                if destination and unquote(target.fragment) not in destination.ids:
                    errors.append("missing anchor: " + ref)
        failures.extend(f"{relative}: {message}" for message in sorted(set(errors)))

    for name in ("sitemap.xml", "index.xml"):
        try:
            ET.parse(root / name)
        except (OSError, ET.ParseError) as error:
            failures.append(f"{name}: {error}")
    index = json.loads((root / "index.json").read_text(encoding="utf-8"))
    sections = Counter(page["section"] for page in index)
    for section in ("projects", "blog"):
        if not sections[section]:
            failures.append("search index is missing section: " + section)
    for entry in index:
        target = root / entry["permalink"].lstrip("/") / "index.html"
        if not target.is_file():
            failures.append("search index points to a missing page: " + entry["permalink"])
    for route in ("projects/xii-engine/", "blog/gpumicrobotswarmsimulation/",
                  "blog/xii-coding-standard/", "contact/", "contact/thanks/",
                  "archive/", "search/", "tags/"):
        if not (root / route / "index.html").is_file():
            failures.append("missing required route: " + route)
    print(f"Checked {sum(not p.alias for p in pages.values())} HTML pages, "
          f"{references} internal references, XML feeds, JSON-LD, and {len(index)} search entries.")
    if failures:
        print("\n".join(failures))
        return 1
    print("All static-site checks passed.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path, nargs="?", default=Path("public"))
    sys.exit(verify(parser.parse_args().root))
