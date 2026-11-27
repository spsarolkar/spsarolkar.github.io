# Current dataset count charts

**Goal:** Replace the primary capstone-era count charts with accurate, readable charts computed from current Hugging Face inventories.

**Design:** Keep the professional Jekyll theme and project URL. The default view counts current Apple Vision clip metadata; a second view counts actual public video files. Do not use the public repository's stale text lists or the personal lab's legacy167-expression CSV. Publish aggregate counts only with exact source revisions and audit notes. Show split totals, category bars and searchable/sortable class bars. Retain old authored figures and notes in a closed historical disclosure. The demo's720 frozen validation clips remain a separately labeled subset.

**Why this approach:** A small generated JSON snapshot keeps each chart reproducible and verifiable without exposing private data or credentials in the browser. Native HTML/CSS bars avoid a new chart library and allow accessible numeric fallbacks. Fetching private metadata from a visitor's browser would expose credentials; generating a new static image for hundreds of labels would retain the readability problem.

## Files

- `_data/sign_language_dataset.json`: verified, sanitized snapshot of aggregate split/category/class counts and source revisions.
- `_includes/sign_language_dataset.liquid`: default rendered charts, data payload and optional explorer controls.
- `assets/js/sign-language-counts.js`: validate aggregates, filter and sort classes, switch source views, progressively update charts.
- `tests/sign_language_counts_test.cjs`: reject corrupt/missing counts and test filtering/sorting without mutating the input data.
- `_sass/_professional.scss`: responsive chart styles using existing theme variables.
- `_projects/2_project.md`: current analysis before the historical capstone, archived old charts clearly collapsed.

## Tasks

- [x] Trace stale charts to static capstone PNG/JPG assets and verify current Hugging Face manifests/file inventory.
- [x] Validate all aggregate totals, source revisions, split names, unique labels and class/category membership.
- [x] Implement the progressive charts with readable exact counts, source switching, class search/sort and no-secret fallback HTML.
- [x] Replace primary old-chart placement while preserving authored historical material.
- [x] Run the existing suites, new behavior tests, production build, link checks and published CSS check.
- [ ] Fresh review, publish through existing Pages workflows, and verify live source totals and browser behavior.

## Review focus

- Public video files and processed clips are different populations with different split definitions.
- A missing split field is an error, not zero; measured zero is displayed as zero.
- Category, class and split totals must reconcile for each snapshot; duplicate class/category keys are rejected.
- Current metadata includes nine label corrections; the frozen demo retains the older labels and is not regenerated.
- No clip poses, private identifiers, tokens or private raw metadata are published; only aggregate counts.
- Charts remain useful without JavaScript and responsive on small screens; search/sort/source changes update the counts and labels together.

## Verification before publication

- Public inventory: 3,679 actual MOV files (2,678 train / 292 validation / 709 test), 15 categories and 262 distinct signs. Source revision `d12293ab05cb5dc2cb6a342c364132a18adc49c9`.
- Current Apple Vision metadata: 4,257 unique records, 273,515 frames (3,330 train / 743 validation / 184 test), 15 categories and 262 distinct signs. Source revision `4b6668cee69e0c9812e8bf2fd92092d35ae47822`. Current stored labels include nine documented corrections; no dataset content was edited by this task.
- Apple Vision has 263 category/sign groups because Clock appears in two categories. Validation has 260 distinct signs across 261 groups; coverage counts distinct names, not groups.
- Every split/category/class total reconciles. The older public text manifests disagree with actual files, so their 4,292 rows are excluded as a count basis and the discrepancy is explained in source notes.
- Seven new chart behavior tests plus five existing gallery tests pass. Python updater tests 13/13 and Ruby CSS cache checks pass.
- Final production build passed in 21.021 seconds; existing unrelated portrait image warnings remain. Link check: 3,586 references / 100 HTML files. PurgeCSS 8 processed 12 CSS files and retained all current chart selectors.
- Generated HTML embeds the exact aggregate JSON, renders 15 category rows and 20 default class rows, and encloses both historical chart images in a closed archive. New script URL is fingerprinted; no duplicate project IDs or exposed credentials found.
- Fresh independent review found no P1/P2 issues and independently verified aggregate sums, source distinctions, fixed scales and distinct-label coverage.

## Aligned v2 refresh and coordinated releases

The current charts use the aligned public video release at `6c3e75429a36680db0831793504cbe5be0b2256e` and frozen keypoint assignments at `94e40d1d22ff9df69fe8382812959f0dd8d607e1`. Both modalities share 4,257 clips across 3,384 train, 486 validation and 387 test clips. Every split covers all 262 signs. The default explorer combines clips for each sign across categories. A category filter keeps its exact local counts and shows the sign-wide test coverage when that category has no test clip. The previous two-source figures above describe the initial chart release. The embedded Transformer demo still uses its frozen 720-clip validation cohort.

For a future revision, update the source revision and digest pins in [the snapshot generator](../../../bin/generate_sign_language_dataset.py). Generate one aggregate JSON snapshot from the matching video manifest, keypoint clip metadata and assignment manifest. Pass the previous public snapshot to preserve the demo's evaluation metadata. Copy the same generated bytes to `_data/sign_language_dataset.json` here and `public/projects/ISL/sign_language_dataset.json` in the personal site repository. Compare the SHA-256 digests before building.

Build and deploy the two sites in the same release. After deployment, compare the rendered video revision, split totals and test coverage on [GitHub Pages](https://spsarolkar.github.io/projects/2_project/#dataset-analysis) and [the personal lab](https://sunilsarolkar.in/projects/ISL-IndianSignLanguageTranslation#visuals).
