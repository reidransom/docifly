# Docifly

Docifly is a documentation theme for Jigyll, using stock Starlight as visual reference only.

## Start a new site

Install Git and Jigyll 1.13.0 or later, then create a site with Docifly:

```sh
jigyll new my-docs --theme https://github.com/reidransom/docifly.git
cd my-docs
```

The installer clones Docifly into `_theme/docifly/`.

Replace `_config.yml` with a minimal site configuration:

```yaml
title: My documentation
theme: docifly
url: ""
baseurl: ""
navigation:
  - label: Overview
    link: /
defaults:
  - scope:
      path: ""
    values:
      layout: default
```

Replace `index.md` with an overview:

```markdown
---
title: Overview
permalink: /
---

Welcome to my documentation.

## Next steps

Add ordinary Markdown pages and list them in `_config.yml`.
```

Serve the site from its new directory:

```sh
jigyll serve --host 127.0.0.1 --port 4322
```

Open <http://127.0.0.1:4322/>. The generated site is `_site/`.

See [Getting started](docs/site/getting-started.md) for page and navigation examples, then read the guides under [`docs/site/`](docs/site/).

## Develop the theme

Theme maintainers should use the installed-consumer workflow in [Developing Docifly](docs/site/development.md). It explains how to preview and rebuild this repository's living documentation without making a direct source build look like consumer-installation proof.

## Attribution

The theme retains upstream notices beside shipped third-party assets. Stock Starlight attribution is in `assets/starlight-LICENSE`, FlexSearch attribution is in `assets/flexsearch-LICENSE`, and the frozen Seti file-icon inventory is covered by `assets/file-tree-icons-LICENSE`.
