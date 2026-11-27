#!/usr/bin/env python3
"""Build the public count snapshot shared by both portfolios from pinned v2 metadata."""

import argparse
from collections import Counter, defaultdict
from hashlib import sha256
import json
from pathlib import Path

SPLITS = ("train", "validation", "test")
SPLIT_COUNTS = dict(zip(SPLITS, (3384, 486, 387)))
VIDEO_REPO = "spsarolkar/AI4Bharat-INCLUDE-dataset"
VIDEO_REVISION = "6c3e75429a36680db0831793504cbe5be0b2256e"
KEYPOINT_REVISION = "94e40d1d22ff9df69fe8382812959f0dd8d607e1"
VIDEO_MANIFEST_SHA = "28a70e610af0221b74551abc77552adbc9cd46f631e19c17b341c1581077e1dd"
KEYPOINT_METADATA_SHA = "360dab8383b8523b9e41d9baa83dfe54187054f1a7df4ba01a5b65fc8cae0793"
ASSIGNMENTS_SHA = "990d520f82dae9cee570a0bc17b39bac7ba0e6eaacafbd5aca6fc43a942a81ba"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verified_bytes(path, expected_digest):
    data = path.read_bytes()
    require(sha256(data).hexdigest() == expected_digest, f"Pinned metadata digest differs for {path.name}")
    return data


def by_id(rows):
    indexed = {}
    for row in rows:
        identity = row["video_id"]
        require(identity not in indexed, "Duplicate clip ID")
        indexed[identity] = row
    return indexed


def jsonl(data):
    return by_id(json.loads(line) for line in data.splitlines())


def counts(counter):
    return {**{split: counter[split] for split in SPLITS}, "total": counter.total()}


def make_snapshot(videos, keypoints, assignments, demo):
    require(videos.keys() == keypoints.keys() == assignments.keys(), "Clip IDs differ across the three sources")
    split_totals = Counter()
    categories = defaultdict(Counter)
    labels = defaultdict(Counter)
    signs = defaultdict(Counter)
    sign_categories = defaultdict(set)
    for identity, video in videos.items():
        clip = keypoints[identity]
        assignment = assignments[identity]
        word, = (label["name"] for label in clip["labels"] if label["type"] == "word")
        category, = (label["name"] for label in clip["labels"] if label["type"] == "category")
        split = video["split"]
        require(split in SPLITS and (word, split) == (video["word"], clip["split"])
                == (assignment["word"], assignment["split"]), "Corrected signs or split assignments differ")
        split_totals[split] += 1
        categories[category][split] += 1
        labels[category, word][split] += 1
        signs[word][split] += 1
        sign_categories[word].add(category)
    coverage = {split: sum(counter[split] > 0 for counter in signs.values()) for split in SPLITS}
    require(split_totals == SPLIT_COUNTS and len(signs) == 262 and len(categories) == 15
            and all(value == len(signs) for value in coverage.values()), "Unexpected v2 count or coverage")
    dataset = {
        "id": "public-videos",
        "label": "INCLUDE v2 videos and keypoints",
        "repository": VIDEO_REPO,
        "repository_url": f"https://huggingface.co/datasets/{VIDEO_REPO}",
        "revision": VIDEO_REVISION,
        "private": False,
        "keypoint_revision": KEYPOINT_REVISION,
        "count_basis": "One row per aligned v2 video, joined by clip ID to the matching keypoints for category labels.",
        "total": len(videos),
        "splits": dict(SPLIT_COUNTS),
        "categories": [{"name": name, **counts(counter)} for name, counter in sorted(categories.items())],
        "labels": [{"name": word, "category": category, **counts(counter)}
                   for (category, word), counter in sorted(labels.items())],
        "signs": [{"name": word, "categories": sorted(sign_categories[word]), **counts(counter)}
                  for word, counter in sorted(signs.items())],
        "unique_labels": len(signs),
        "split_label_coverage": coverage,
        "notes": [
            "All video IDs, corrected sign labels and split assignments match the frozen v2 keypoint manifest.",
            "Category counts use each clip’s dataset category. Clock has clips in Electronics and Home, with its test clip in Home.",
            "Coverage counts distinct signs across all categories. The v2 release uses clip-level splits.",
        ],
    }
    return {"schema_version": 1, "checked_on": "2026-11-27", "datasets": [dataset], "demo": demo}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("video-manifest", "keypoint-clips", "assignments", "previous-snapshot", "output"):
        parser.add_argument(f"--{name}", type=Path, required=True)
    args = parser.parse_args()
    videos = jsonl(verified_bytes(args.video_manifest, VIDEO_MANIFEST_SHA))
    keypoints = jsonl(verified_bytes(args.keypoint_clips, KEYPOINT_METADATA_SHA))
    assignments = by_id(json.loads(verified_bytes(args.assignments, ASSIGNMENTS_SHA))["assignments"])
    demo = json.loads(args.previous_snapshot.read_text(encoding="utf-8"))["demo"]
    snapshot = make_snapshot(videos, keypoints, assignments, demo)
    args.output.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
