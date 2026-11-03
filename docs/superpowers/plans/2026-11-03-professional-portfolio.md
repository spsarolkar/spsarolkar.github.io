# Professional Portfolio Implementation Plan

> **For agentic workers:** Use the existing design and carry the authorized work
> through implementation, independent review, build verification and publication.

**Goal:** A simple modern professional portfolio that retains the site's content.

**Architecture:** Preserve Jekyll/al-folio routes, plugins and locked stack.
Replace shared presentation and simplify the homepage, project and writing
indexes. Update the existing YAML CV rather than introducing a second active CV.

**Tech stack:** Jekyll 4.4.1, Liquid, Sass, Bootstrap 4.6.2, existing JavaScript.

**Spec:** ../specs/2026-11-03-professional-portfolio-design.md

## Global constraints

- Preserve all 15 posts, six project bodies, collection routes and media.
- Preserve the locked Gemfile/package inputs and GitHub Pages workflow.
- Use latest supplied CV facts; no invented achievements, dates or skill scores.
- Keep professional and personal-lab destinations distinct.
- Preserve existing light/dark, search, comment and feed contracts.

## Review focus

- Long headings, code, diagrams and tables fit phones without page overflow.
- Dark mode remains readable, including legacy cards, CV and code snippets.
- Hidden mobile navigation works with keyboard and reports expanded state.
- Existing article/project routes and older résumé links remain reachable.
- Missing credential dates do not produce empty labels or invented status.

## Tasks

### 1. Baseline and current professional data

- [x] Inspect source, publishing setup, current site and supplied latest CV.
- [x] Create isolated codex/professional-portfolio checkout at ed0ea2d.
- [x] Install existing locked tooling outside source and build untouched archive.
- [x] Update _data/cv.yml, skills, five employer badges, verified certifications
      and new PDF asset; retain original learning records and recognition.
- [x] Check latest CV fields, original badge prefix and uploaded asset hashes.

### 2. Shared professional design and homepage

- [x] Update _includes/header.liquid/footer.liquid, _layouts/default.liquid,
      about.liquid and page.liquid as needed for accessible shared structure.
- [x] Add one professional Sass partial imported after existing theme rules.
- [x] Replace _pages/about.md with current professional introduction and
      sectioned homepage; preserve biography details on CV/archive routes.
- [x] Update titles, SEO description, résumé pointers and secondary navigation.
- [x] Restyle CV includes consistently, preserving their data and links.

### 3. Project, writing and archive presentation

- [x] Improve _pages/projects.md, _pages/blog.md and project card include.
- [x] Keep all categories/projects/posts and pagination; fix broken local media
      and /apps/ navigation without changing article/project URLs or bodies.
- [x] Ensure archives, apps, repositories, people and books inherit the theme.

### 4. Verification and delivery

- [x] Production build; meaningful rendered route/content/media checks against
      baseline. Static visual changes do not need tests mirroring CSS markup.
- [x] Desktop/mobile, light/dark, search/menu, reading and credential checks.
- [x] Independent review and correction of blocking defects.
- [ ] Scoped commits, existing GitHub Pages deployment and live verification.

Logs, baseline and verification receipts: /private/tmp/professional-site-*.


## Implementation decisions and verification

Implementation lives at /private/tmp/spsarolkar-professional-site on
codex/professional-portfolio. The clean original master checkout is fast-forwarded
to published source after verification.
User delegated the design and execution choices. Local Ruby3.3.8 bootstraps the
locked Bundler4.0.4/Jekyll4.4.1 stack in isolated temporary directories; CI retains
Ruby3.3.5. No application dependency input changed. ImageMagick, an existing build
requirement, was installed after a bounded disk check, without global cleanup.

Baseline: ed0ea2d archived independently and built before comparison. All94 old
sitemap routes remain; /publications/ and /books/2024/ compatibility pages repair
old links. A missing old /images/ screenshot path is retained as an asset alias.
Image generation now also covers assets/projects and assets/blog, correcting45
existing missing srcset URLs. Current inventory:96 sitemap routes,100 HTML files,177 WebP
files, zero missing local href/src/srcset references. All24 authored files
(15 posts,6 projects,1 book,2 news) remain. Twenty-two are byte-identical; two
articles have only three broken image URL references repaired. The previous PDF URL and
bytes remain. Latest PDF and supplied AI Engineer image match upload SHA256.

Content checks cover all118 current CV values,35 technical skill names,5 training
badges,20 existing Credly records and2 official certification records. Existing
languages, honors and interests remain. Skill percentages were removed from
presentation. Current role/dates and new résumé path match the supplied CV.

Independent review found one content regression: retained technology names were
not visible. A rendered check failed first, then passed after adding the compact
Technologies & Tools CV section. Career experience now precedes competency lists;
CV section navigation supports scanning. Project thumbnail boxes were corrected
after an observed specificity conflict. The portrait uses responsive WebP.

Browser review covered desktop/light/dark and400px layouts; responsive menu was
opened/closed using both pointer and keyboard, site search opened with Ctrl-K and
returned project/post groups, original learning collection expanded, long writing
headings and technical code blocks remained readable. Review also exposed an
inherited stylesheet import404 and an always-empty CSS fingerprint. Unused fade
import was removed, and tests/css_cache_test.rb failed before and passed after
fingerprinting actual Sass partials and the entry point. The canonical Giscus
owner/repository value was corrected to match the legacy workflow's existing
build-time update; no application access or comment permissions changed.

Both existing publishing workflows retain their targets/permissions/triggers.
The official Pages workflow now installs the same existing image prerequisite
and applies the same CSS processing as the legacy workflow. Both run the cache
regression and pin the tested PurgeCSS8.0.0. A separate read-only review approved
these minimal prerequisite changes. This is build parity, not workflow migration.

Local production build, frozen lock resolution, cache regression, whitespace,
rendered content, route/fragment/media checks and post-purge inspection pass.
Logs/receipts/tooling stay under /private/tmp/professional-site-*; no logs or
generated site are committed. Existing Sass deprecation notices and3 duplicate
prof_pic WebP output warnings predate the refresh; both sources depict the same
existing photograph. Old experimental articles retain their historical claims;
the professional homepage does not repeat disputed accuracy highlights.

## Publication compatibility checks

GitHub's ubuntu-latest moved to26.04, which cannot supply pinned Ruby3.3.5.
All four Ruby build/check workflows now use ubuntu-24.04 and the same tested CSS
tool version; existing targets and permissions remain. An explicitly included
.nojekyll marker preserves the generated /_pages/dropdown/ legacy route on Pages.

Source87513ea passed both publishing workflows. Live verification returned200 for
all96 sitemap routes, matched all96 pages' rendered content to the tested build,
checked116 root asset references, exact PDF/badge hashes, CSS fingerprint and the
styled404. Browser inspection confirmed the public homepage/CV and working Giscus
comment form. The local server is stopped and the public homepage remains open.

The post-deploy link check exposed one malformed old vehicle-telemetry image
reference. Expanding the host check to resolve relative URLs also exposed two old
mock-exam screenshot paths. Those three references now resolve to existing media;
article text is unchanged. tests/site_links_test.py reproduces the failures and
passes3581 local references across100 generated HTML files after repair. It runs
before publication in both publishing workflows and both Ruby check workflows.
The final comparison build uses TZ=UTC to match GitHub's date formatting.

The broader public check includes same-origin absolute links as well. One old
Docker article address embedded in the Kubernetes post now has a compatibility
page that redirects to its current article and sets the current canonical URL;
the compatibility page stays out of the sitemap. The two separately hosted
GitHub Pages app roots both return200. No other missing same-origin paths exist.
Both publishing jobs and the post-deploy link check passed for83f9b07; the
official deploy job needed one retry after the two pre-existing publishers
overlapped. Final source also includes the legacy Docker compatibility page.
