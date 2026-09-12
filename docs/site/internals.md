---
title: Theme internals
permalink: /internals/
---

Starlyt is a Git-installable Jigyll theme. Its implementation is a server-rendered shell, shipped CSS, and small browser enhancements. The documentation consumer supplies only configuration, Markdown, and content artwork; it does not copy the implementation into its own source.

## Installation and ownership

Jigyll resolves the selected theme from the consumer's `_theme/` directory. Theme layouts, includes, Sass, and assets participate in the normal build; consumer files with the same names take precedence. Theme configuration and data are not merged into the site.

That makes the ordinary installed site the useful manual exercise surface. A direct build from the theme development tree could hide an installation or override problem. The repository README explains how to install and refresh this documentation's consumer without a custom harness.

## Layout and includes

| Source | Responsibility |
| --- | --- |
| `_layouts/default.html` | Documentation shell with navigation, heading TOC, optional hero, article, and shared controls |
| `_layouts/splash.html` | Wide shell without sidebars, with the same optional hero and shared controls |
| `_layouts/not-found.html` | Explicit consumer 404 presentation using the splash shell and recovery actions |
| `_includes/hero.html` | Escaped hero copy, validated consumer-hosted artwork, and ordered actions |
| `_includes/private/action-link.html` | Validated action URL and shared primary, secondary, or minimal presentation |
| `_includes/header.html` | Site-title link, search, and initially hidden color selector |
| `_includes/navigation.html` | Recursive ordered navigation, native group disclosures, current-page marking, and optional link badges |
| `_includes/toc.html` | H2/H3 heading links from `page.headings`, preserving engine IDs and omitting ID-less or empty labels |

The page type and hero are independent. A default page without `hero` gets one ordinary H1; either layout with `hero` gets one hero H1 instead. Splash and not-found pages retain the fixed header while omitting navigation, the mobile menu, and both sidebars. The not-found route remains consumer-owned because a theme cannot configure the host's missing-route behavior.

Public content includes live under `_includes/components/`. `icon.html` validates a frozen 130-name registry, fixed size/color vocabularies, and explicit decorative or labeled accessibility semantics; `tools/icons/icons.json` generates both its trusted private path branches and the complete documentation fixture. `badge.html` validates escaped text variants and sizes; a badge placed on the source line after a heading is styled beside it without entering the heading's ID or navigation label. `steps.html` decorates only a rendered outer ordered list, retaining its native `start` value and leaving nested lists or malformed input ordinary. `file-tree.html` recursively renders escaped structured data through a private include, bounds traversal at eight directory levels, and marks its illustrative labels out of search. `callout.html` validates one of four aside types, preserves captured Markdown, labels each aside from its visible escaped title, and falls back to the selected type's icon when a custom name is unknown.

Text labels and titles are escaped. A navigation badge contributes to its link name unless an equivalent `aria_label` supplies that name and hides redundant visible text from assistive technology. Theme asset URLs and navigation links pass through `relative_url` and attribute escaping. Page URLs and navigation links must agree for the current-page marker to appear.

## Styles and shipped output

`_sass/starlyt.scss` is the entry point. It loads focused partials for reset, properties/tokens, navigation, TOC, Markdown, heading anchors, code, color modes, search, hero/page presentation, and content components, then defines the shell geometry. Reset loading precedes the base layer; layer order is intentional.

Consumers load `assets/starlyt.css`. Maintainers changing Sass compile that shipped artifact with a Sass CLI:

```sh
sass --no-source-map _sass/starlyt.scss assets/starlyt.css
```

Run this from the theme repository root, not the documentation consumer. A standalone Dart Sass executable can supply this maintainer command without Node.js. Merely editing Markdown does not require compilation, and consumers do not need a Sass installation.

The principal responsive transitions are 50rem for sidebar/menu placement and 72rem for the TOC rail/disclosure. At the default 16px browser font setting these are 800 and 1152 CSS pixels. They are font-relative layout decisions, not promises about named devices.

## Browser enhancement ownership

The layout loads `assets/color-mode.js` synchronously in the head before CSS. The other enhancement assets are deferred in this order: navigation, prose, TOC, FlexSearch, search, tabs, then code. No client renderer or hydration framework is involved.

### Color mode

`assets/color-mode.js` distinguishes the stored preference from the effective palette. It reads `starlight-theme`, applies the root `data-theme` value, responds to system changes, and initializes the one selector after DOM readiness. Storage errors do not prevent in-memory selection. A media query moves the same picker between header and mobile navigation.

### Navigation

`assets/navigation.js` enhances the native navigation popover and disclosures. It makes covered content inert while the mobile menu is open, handles keyboard focus and Escape, closes the menu after link selection, and cleans up at the responsive transition.

Session persistence stores group state and scroll position under a base-URL-specific key. A signature of navigation labels and links prevents stale state being applied after the consumer changes its navigation. Native controls still work when storage access fails.

### Heading anchors

`assets/prose.js` discovers headings with IDs inside `#article`, wraps them for anchor presentation, and links to the IDs already emitted by Jigyll. It does not derive new slugs or rewrite heading text.

### Table of contents

`_includes/toc.html` renders an Overview entry and eligible H2/H3 entries from Jigyll 1.12.0's `page.headings` metadata. The engine collects that flat, article-ordered `{level, id, text}` list from rendered article HTML before layouts; it includes `.no_toc`, nested-Markdown, repeated, and explicit IDs unchanged. Starlyt skips entries without IDs or labels and does not derive replacement slugs.

`assets/toc.js` enhances the existing links. It switches between a rail and a disclosure, maintains current-section feedback from the article headings, and focuses the emitted target after link selection. It does not create, remove, or label TOC entries.

### Tabs

`assets/tabs.js` enhances top-level `.tab-item` sections into the ARIA tabs pattern, assigns deterministic IDs from page-local DOM order, and keeps exact text-label synchronization separate from focus. It clones any decorative server-rendered icon into the tab control without adding it to the accessible name. Versioned persistence is optional per sync key and storage failures retain in-memory behavior. Without the enhancer, every panel heading and body stays visible in source order.

### Clipboard

`assets/code.js` finds code blocks inside the article and adds a focusable frame/control where the Clipboard API is available. It reads `code.textContent`, preserves whitespace, prevents overlapping copy attempts, and reports the actual write result. Syntax markup is left intact.

### Search

`assets/js/zzzz-search-data.json` is a front-matter-bearing theme asset whose `search-data` layout runs after Jigyll renders all page bodies. It emits deterministic same-origin records for published default-layout HTML pages and output-enabled collection documents. Each record contains the title, base-URL-correct URL, article text, and Jigyll heading metadata; `search_exclude: true` omits a document. Component regions marked with `data-search-exclude` are delimited by private build-time markers and removed from the article body before text normalization, so illustrative file-tree labels do not enter the corpus.

`assets/flexsearch-0.8.212.min.js` is the pinned Apache-2.0 FlexSearch browser bundle; its license is retained in `assets/flexsearch-LICENSE`. `assets/search.js` normalizes case and canonical Unicode form, requires every token, and allows a prefix only on the final token. It verifies exact matches itself after FlexSearch finds candidates, ranks title/heading/body hits deterministically, and uses text-only DOM APIs for corpus values. The disabled control remains unavailable without JavaScript; the native dialog supplies loading, guidance, results, failure, and retry states.

Highlighting itself is server-side Jigyll/Chroma behavior. Differences from stock Starlight's code highlighter cannot be repaired by inventing tokens in CSS or the copy handler.

## Fallback and change discipline

Without JavaScript, the default dark palette, content, links, images, native navigation, server-rendered TOC, server-highlighted code, and every tab panel remain readable. Anchor controls, active-section feedback, responsive TOC disclosure behavior, code copying, tab selection/synchronization, and mode selection are enhancements. Browser support for native popovers is still relevant to the mobile fallback.

When changing theme behavior, update the explanation and its real example together. Inspect the installed consumer rather than adding a second demo implementation. The [manual-inspection guide](../inspection/) gives starting points without imposing automated testing or a screenshot baseline.

## Attribution and historical scope

Stock Starlight and Expressive Code attribution remains in the shipped license assets. The frozen 130-name public icon paths are covered by `assets/starlight-LICENSE`; the separate Seti file-icon inventory used by file trees retains its notice in `assets/file-tree-icons-LICENSE`. The frozen stock Starlight POC revision was `39d4e71f23b3fb6fde0e77eb983fcd38629b70b9`; historical findings and code-token limitations are recorded in the repository's `docs/poc.md` and `evidence/poc/`.

The Node.js POC tooling was removed without replacement. Those historical results are not a current automated gate or proof of complete visual parity, interaction parity, or Astro compatibility.
