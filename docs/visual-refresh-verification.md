# Visual refresh verification

Verified locally on October 27, 2026, on `TE/VisualRefresh`.

## Architecture and presentation

- Preserved Hugo Extended 0.164.0, Netlify, page bundles, and existing published content routes.
- Root layouts provide a dedicated homepage, curated Work collection, technical publication, supporting pages, archive, topics, Search, and 404 recovery.
- One token system supplies neutral light and dark palettes, a blue accent, system typography, and responsive spacing.
- Shared image components honor authored covers and produce responsive derivatives.
- Featured selection is controlled by optional front matter. Existing technical article bodies are preserved, apart from a malformed external link and one contradictory project summary.
- Leadership content is back in Markdown. Contact retains its provider and gains native validation, a honeypot, and a dedicated return route.
- Native galleries preserve existing calls while removing jQuery and plugin initialization. Keyboard navigation and no-script access were verified.
- Metadata is serialized as valid JSON-LD, with resolved social imagery and a default preview image.

## Executed checks

1. `hugo version`: Hugo Extended 0.164.0.
2. `hugo server -D --disableFastRender`: local preview starts successfully.
3. `hugo --gc --minify --baseURL https://theophiluse.xiitechnologies.com/`: succeeds with no warnings.
4. `python scripts/verify_site.py <production-output>`: 155 HTML pages, 6,121 internal references, sitemap, RSS, JSON-LD, and 27 search entries pass.
5. `node scripts/verify_browser.cjs`: 14 representative routes pass at 1440, 768, 390, and 320 pixels with no horizontal page overflow, missing loaded images, or uncaught JavaScript errors.
6. Browser interactions pass: mobile disclosure and Escape, theme persistence, populated/empty search, safe query rendering, gallery previous/next and Escape with focus restoration, mathematics including escaped percent signs, code copying, and native contact validation.
7. The valid form submission is intercepted locally. No real email is sent.
8. Navigation and gallery images work with JavaScript disabled. Reduced-motion scrolling is honored.
9. Desktop and mobile screenshots were captured under `.cache/visual/` and visually inspected.

Visual inspection covered homepage composition in light and dark modes, mobile navigation, Work, the engine gallery, a long-form article, and Contact. Automated checks cover the remaining representative routes. This is not a complete assistive-technology audit.

## Release checks requiring the hosted environment

- Actual FormSubmit delivery and the provider's redirect behavior have not been exercised.
- Netlify configuration was checked locally; no hosted preview or production deployment was created.
- Third-party KaTeX and embedded videos require their external services. The local math-rendering check passed.
- The GitHub validation workflow was added but has not run remotely.

No branch was pushed and no deployment was triggered.
