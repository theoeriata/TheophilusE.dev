# Theophilus Eriata

A Hugo portfolio for graphics programming, simulation, robotics, and systems engineering.

- Live site: [theophiluse.xiitechnologies.com](https://theophiluse.xiitechnologies.com/)
- Generator: **Hugo Extended 0.164.0**, pinned in Netlify and GitHub workflows.
- Hosting: Netlify. Local builds and commits do not publish changes.

## Work locally

```sh
hugo version
hugo server -D --disableFastRender
```

Open the address printed by Hugo, normally [localhost:1313](http://localhost:1313/).

To build and check production output:

```sh
hugo --gc --minify
python scripts/verify_site.py public
```

If the system cache is restricted, add `--cacheDir .cache/hugo`. Build artifacts, image caches, and local verification screenshots are ignored by Git.

The pull-request validation workflow builds and checks the site without deploying it. The separate, pre-existing GitHub Pages workflow remains manual; Netlify remains the primary deployment architecture.

## Author content

Projects and articles remain Markdown leaf bundles:

```text
content/projects/<slug>/index.md
content/projects/<slug>/images/...
content/blog/<slug>/index.md
```

Keep existing bundle paths and permalinks. The microbot article's source directory contains Unicode non-breaking hyphens; its published route is `/blog/gpumicrobotswarmsimulation/`.

Existing `title`, `description`, `tags`, `cover.image`, `cover.alt`, and `editPost` metadata continue to work. Optional presentation fields:

```yaml
featured: true
featuredWeight: 1
shortTitle: "XII Engine"
projectType: "Engine architecture"
technologies: ["C++23", "Rendering", "Editor tooling"]
cover:
  image: "images/screenshot.png"
  alt: "Describe the actual screenshot."
  relative: true
```

The home page selects the first four featured projects and articles in ascending `featuredWeight` order. The Work collection promotes two projects and retains every other project in its catalog. Projects without imagery use a text treatment. Covers resolve from the authored bundle resource before falling back to local images.

About and Leadership are authored in Markdown. The contact form is in `content/contact.md`, uses the existing FormSubmit destination, and returns to `/contact/thanks/`. Verify actual email delivery separately when releasing.

## Templates and styles

Root-level layouts override the bundled themes. `layouts/index.html` owns the home page; section layouts own Work and Writing. Shared partials resolve images, render project features, and supply navigation and metadata. Theme source files remain untouched.

`assets/css/core/theme-vars.css` is the single source of design tokens. The head partial bundles PaperMod's reset and remaining core styles, then loads `design-system.css` before page and component styles. Small common CSS overrides intentionally mask inherited theme styles. Hugo minifies and fingerprints CSS and JavaScript; Netlify post-processing stays disabled to preserve integrity hashes.

System fonts avoid third-party font requests. Bundle covers use responsive WebP derivatives. Existing Markdown images, mathematics, code highlighting, anchors, and page resources remain supported. Goldmark passthrough preserves mathematical notation for KaTeX, which loads on technical pages.

The root `gallery` shortcode now renders a native, progressive image gallery. Existing bundle calls and matching, sort order, image-resize, and thumbnail-resize options remain valid. A small vanilla script adds an accessible dialog, previous/next controls, arrow keys, Escape, and focus restoration. Without JavaScript, thumbnails link directly to full images. Legacy plugin-only presentation flags can remain in old calls; no jQuery or lightbox plugin is loaded.

Search uses Hugo's generated `index.json`. It searches titles, topic labels, and article text locally, supports a shareable `?q=` URL, and renders result text safely.

## Browser verification

An optional Playwright script checks representative routes at desktop, tablet, and small-phone sizes:

```sh
node scripts/verify_browser.cjs
```

It requires Playwright available to Node and an installed Microsoft Edge browser. This is development tooling, not a site runtime dependency. Start the local server first. You can set `SITE_TEST_URL` to another localhost port and `SITE_TEST_OUTPUT` to change the screenshot directory.

The checks include overflow, broken images, mobile navigation, persistent themes, search, gallery keyboard interactions, math, code copying, native form validation, no-JavaScript navigation, and reduced motion. FormSubmit requests are intercepted; the script never sends a real message.

See [verification notes](docs/visual-refresh-verification.md) for the recorded results and remaining release checks.

## License

Source: [MIT](LICENSE.md). Content: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), except where noted.
