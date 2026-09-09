---
title: Starlyt
permalink: /
---

Starlyt is a documentation theme for **Jigyll**. Its visual and responsive reference is **stock Starlight**: the default documentation experience, not the customized Starlight website.

This site is both the project documentation and a place to try the theme. The sidebar, heading links, table of contents, code blocks, and color selector are real theme features—not illustrations of a separate demo.

## Start with a working site

Read [Getting started](./getting-started/) to install the theme and configure a consumer. No Node.js, Astro, or Sass installation is needed to consume the shipped theme.

Then organize your [navigation](./navigation/), write [headings](./headings/), and choose a [deployment location](./deployment/).

## Explore the examples

- [Markdown](./markdown/) shows lists, tables, images, quotations, and inline formatting alongside authoring examples.
- [Code blocks](./code/) shows highlighted code, whitespace, and horizontal overflow. Try copying a block.
- [Color modes](./color-modes/) explains Dark, Light, and Auto, including what happens without JavaScript or storage.
- [Manual inspection](./inspection/) suggests ways to try the site with a keyboard and at different window sizes.

## Understand the implementation

[Theme internals](./internals/) maps the layout, includes, Sass, and browser enhancements to their responsibilities. These docs are ordinary Markdown in a separate installed consumer. They do not require a browser test runner or a documentation preprocessing step.

## Scope and limitations

Starlyt currently provides a documentation shell, recursive navigation, heading navigation, Markdown/code presentation, and color modes. Search, Astro/MDX components, tabs, cards, and the full Starlight configuration interface are not part of this supported surface.

**Visual parity** means agreement in appearance across an explicitly defined set of conditions. **Interaction parity** means agreement in observable control behavior. Using this site manually does not establish complete visual parity or interaction parity with stock Starlight.

Historical POC results remain in the repository's `docs/poc.md` and `evidence/poc/`. Their capture tooling has been retired; those results are not a fresh measurement of this documentation site.
