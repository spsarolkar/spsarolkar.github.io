# SignLanguageTranslate profile demo implementation plan

**Goal:** Let profile visitors try the current Hugging Face Transformer demo and find its model and dataset sources.

**Design:** Keep Jekyll, existing project URLs, the professional light/dark theme, and the original capstone material. Use a responsive, lazy-loaded iframe of the existing public Space on the homepage and project page, with a persistent direct link and a cold-start explanation. The Space runs inference using private model and keypoint artifacts; the portfolio receives no credentials or weights. Explain that inference uses saved Apple Vision poses for isolated signs, not visitor video or a webcam. Keep the historical LSTM pipeline separately labeled. No extra service, framework, or dependencies.

**Approaches considered:** Direct Space embedding reuses the verified, existing model runtime and dataset selector. A custom frontend would require an inference API and duplicate the Space's evaluation controls. Browser-only inference would require a separately qualified export and compatible pose extraction. Use embedding under the user's existing delegation of design and implementation choices.

**Verified sources (2026-11-27):** Public Space `spsarolkar/SignLanguageTranslate` at `703912e546afa2cd2c309ce2bbf8947cc672d8eb`; configured model revision matches latest private model `07a705b062728891060b9cd014204bf794202004`. Rolling epoch 31 and causal epoch 102 are the uploaded inference artifacts. Public videos are from `spsarolkar/AI4Bharat-INCLUDE-dataset`; saved keypoints intentionally use the Space's pinned dataset revision, not the dataset's moving head.

## Tasks

- [x] Inspect current site, deployed Space, latest model metadata, and private/public access boundaries.
- [x] Prepare an isolated checkout and unchanged locked build environment; run baseline unit checks.
- [x] Add a shared accessible demo embed and responsive styles on the homepage and project page.
- [x] Update homepage, CV and Apps links; retain and label the historical capstone and dataset analysis.
- [x] Run production build, local-link check, existing test suites and CSS purging; inspect rendered embeds and links.
- [x] Run one live validation-clip inference in the Space; do not rerun the full evaluation or train models.
- [ ] Obtain a fresh scoped review, publish through existing GitHub Pages, and verify live routes.

## Review focus

- Embedding fails or the Space sleeps: the direct demo link stays available.
- Mobile and dark theme: the iframe fits its container, scrolls internally, and keeps its accessible title.
- Private artifact access: only Hugging Face's server uses credentials; no token or private data enters the generated website.
- Model claims: distinguish isolated-clip validation and archived results from live computation; preserve capstone history without claiming unsupported upload, webcam or sentence translation.
- Existing URLs, credentials, galleries, authored images, dataset tables and source code examples remain available.

## Verification before publication

- Production Jekyll build passed in 22.768 seconds with unchanged dependencies. Existing portrait-WebP destination warnings remain unrelated.
- Local link check: 3,585 references across 100 HTML files passed. The first check was accidentally started before the build finished and inspected incomplete output; the completed build passed on rerun.
- Existing JavaScript gallery tests: 5/5; Python updater tests: 13/13; Ruby CSS cache check passed.
- PurgeCSS 8 processed 12 CSS files; demo frame, inset keyboard focus, pipeline and source-link styles survived.
- Generated homepage has a closed native disclosure, the project demo opens by default, and both retain titled lazy frames and persistent direct links. No duplicate IDs were found on either page. HTML CV and Apps links point to the current Space; historical JSON resume entries point to the project history. Authored PDF resumes are preserved.
- One live `Woman` / `include-004` clip ran successfully in the Space. The caption changed from archived predictions to `Predictions computed by the Space at 250 ms intervals.` No full evaluation, training, model upload or repository visibility change was performed.
- Fresh review found two issues: clipped disclosure focus and the current Apps entry retaining the capstone's 2024 year. Both corrected before publication; production build and checks repeated.
