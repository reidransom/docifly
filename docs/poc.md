# POC implementation and evidence

## Scope

Tickets 29–35 implement the documentation-only POC, authorized by the implementation request. This is not a claim of complete Starlight, Astro, configuration, browser, or device compatibility. The proposed pixelmatch threshold remains 0.1 with a maximum 0.1% differing pixels; failures must be reported, never normalized away.

## Reference baseline (29)

The source is stock Starlight commit `39d4e71f23b3fb6fde0e77eb983fcd38629b70b9`. `tools/poc/reference.mjs` exports that revision into ignored `.poc/reference`, installs its frozen lockfile with pnpm 11.22.0, builds the workspace, and replaces only the disposable basics example with the controlled documentation fixture. The original checkout is not modified. Search, pagination, credits, code title frames, and line numbers are disabled; no marketing homepage or custom CSS is used.

```sh
npm --prefix tools/poc ci
STARLIGHT_SOURCE=/home/reid/tmp/starlight npm --prefix tools/poc run reference
# In a separate terminal:
cd .poc/reference/examples/basics
./node_modules/.bin/astro preview --host 127.0.0.1 --port 4321
# From the repository root:
npm --prefix tools/poc run capture -- reference http://127.0.0.1:4321
npm --prefix tools/poc run typecheck
```

`fixtures/content` is the single source of Markdown for both builds. `fixtures/fixture.svg` supplies the shared image. `tools/poc/fixtures.json` defines the titles, URLs, ordered navigation, and full viewport matrix. The Astro adapter resolves its relative image at build time; the Jigyll consumer serves the same image at its relative public URL. No theme implementation files are embedded in the fixture.

The capture runner uses `/usr/bin/chromium`, headless, DPR 1, zoom 1, default browser font size 16px, `en-US`, UTC, and explicit light/dark system and storage state. It records the Chromium version and executable hash, kernel, installed font list, CSS font stacks, CDP-resolved paragraph fonts, scroll position, code rectangles, and clipboard output. It waits for the network, fonts, and two animation frames; animations/transitions and caret blinking are disabled, without hiding theme content. Each case gets an isolated browser context. Reproduction requires the same executable and font environment identified in the manifest, not merely any Chromium installation.

`evidence/poc/reference-build.json` records the toolchain, configuration, revision, and lockfile checksum. `evidence/poc/reference/manifest.json` identifies every retained unmasked full-page PNG and immediate reference-versus-reference repeat measurement. The matrix comprises 18 primary and eight boundary captures plus 14 interaction captures (seven states in both modes).

Interaction recipes are executable in `capture.mjs`: mobile Menu button, mobile TOC summary, all sidebar groups collapsed/expanded, scroll the “Maintain the examples” heading into view, keyboard focus on the skip link, and first code-copy button with actual clipboard readback. Storage is reset for each recipe. Focus and copy cases use desktop width; menu and TOC use 390×844. Scrolled captures retain the observed scroll position in the manifest.

Calibration: independent `reference-repeat` contexts passed all 40 comparisons using `node tools/poc/compare.mjs reference reference-repeat`. Immediate repeats had zero differing pixels. The retained manifests identify Chromium 152.0.7977.82 and Liberation Sans paragraph rendering on Linux. `fixture-hashes.json` freezes the shared inputs.

## Theme installation and shared contract (30)

Consumers run `jigyll new my-site --theme <git-url>`, set `title`, `navigation`, and a layout default in their own `_config.yml`, then run `jigyll build` or `jigyll serve`. Theme configuration/data are not merged. Jigyll 1.10.1 is the tested engine. There is no consumer Node/Astro/Sass dependency.

```yaml
title: My documentation
theme: starlyt
baseurl: '' # Or /docs
navigation:
  - label: Overview
    link: /
  - label: Guides
    items:
      - label: Installation
        link: /guides/install/
defaults:
  - scope:
      path: ''
    values:
      layout: default
```

Navigation is an ordered recursive list. Each entry has a text `label` and either a root-relative `link` (without `baseurl`) or `items`. Pages use ordinary `title` and `permalink` front matter. Author article links/images relatively for portability between hosting roots. Labels and titles are escaped. Consumers can override includes, layouts, or assets normally; no internal-file copying is needed for installation.

Shared implementation ownership is sequential:

- `_layouts/default.html` composes the fixed header, `#site-nav`, `#main-content`, `#article`, and `#toc-slot`.
- `#article` contains only rendered Markdown. The page H1, header, sidebar, and heading navigation are outside this discovery boundary.
- `_includes/header.html` owns the site-title and mode-selector insertion point. `_includes/navigation.html` owns recursive consumer navigation.
- Root `data-theme` is the effective `light`/`dark` palette. The selector's preference is separate (`auto`/`light`/`dark`), persisted under `starlight-theme`.
- Early mode initialization runs synchronously in the head, before CSS and body; navigation, TOC, and code enhancements run as ordered deferred assets. No client renderer or hydration framework is involved.
- `_sass/starlyt.scss` is the shared entry point, with focused partials for tokens, reset, navigation, TOC, and Markdown. Maintainers compile with `sass --no-source-map _sass/starlyt.scss assets/starlyt.css`. Shipped CSS is the consumer artifact.
- Responsive transitions retain 50rem (800px) and 72rem (1152px), at default browser font settings. Automatic TOC/copy require JavaScript; fallback content must not display empty enhanced controls.

`node tools/poc/consumer.mjs <unique-name> [baseurl]` snapshots only theme directories into a temporary local Git source, performs a real `jigyll new --theme`, supplies ordinary consumer content/configuration, and runs the normal build. Targets must be new. It records the exact temporary Git revision/tree and engine commands in `evidence/poc/<name>-build.json`. It never switches the development branch or uses a worktree.

## Navigation, headings, Markdown, and modes (31–34)

The mobile menu uses a native popover and nested native disclosures. Enhancement adds focus containment, Escape restoration, covered-content inertness, breakpoint cleanup, and session-scoped disclosure/scroll persistence. Navigation labels remain consumer-owned text. Heading anchors and the generated H2/H3 TOC use the IDs already emitted by Jigyll; they do not derive replacement slugs. The TOC discovers headings only inside `#article`, tracks the current section, and becomes an inline desktop rail or mobile disclosure.

Markdown and code styling target the actual Jigyll/Chroma output. The copy enhancement reads `code.textContent`, preserves whitespace, reports real clipboard success or failure, and does not alter syntax markup. Copying requires JavaScript and the browser Clipboard API in a secure context. No-JavaScript reading retains links, images, native navigation disclosures/popover, and server-highlighted code; automatic TOC, heading-anchor enhancements, copying, and the mode selector are absent rather than presented as nonfunctional controls. The no-JavaScript palette is the documented default dark palette.

Mode preference is `auto`, `light`, or `dark`. Auto follows live `prefers-color-scheme` changes. Explicit choices survive ordinary page navigation; invalid or unavailable storage falls back safely to auto. The blocking head asset initializes the effective palette before body paint. The same selector moves between header and mobile navigation rather than creating duplicate focusable controls.

Functional evidence is retained in `navigation-checks.json`, `toc-checks.json`, `code-checks.json`, `mode-checks.json`, `integration-checks.json`, and `geometry-checks.json` under `evidence/poc/`. Browser smoke scenarios covered both hosting roots, both modes, repeated headings, encoded fragments, outside clicks, keyboard focus, Escape, resizing open controls, storage denial, clipboard denial, exact copied whitespace, content containment, and JavaScript-disabled reading. These are observed browser results, not claims of cross-browser coverage.

## Reproducing the installed consumer (35)

The acceptance consumer is created through the real Git theme installer. The maintainer adapter writes only ordinary consumer configuration, Markdown/front matter, and the fixture image; it adds no consumer build preprocessing. The minimal runtime directory below deliberately contains no Node, Astro, or Sass executable:

```sh
mkdir -p .poc/runtime-bin
ln -s "$(command -v jigyll)" .poc/runtime-bin/jigyll
ln -s "$(command -v git)" .poc/runtime-bin/git
ln -s "$(git --exec-path)/git-upload-pack" .poc/runtime-bin/git-upload-pack
CONSUMER_PATH="$PWD/.poc/runtime-bin" node tools/poc/consumer.mjs release
CONSUMER_PATH="$PWD/.poc/runtime-bin" node tools/poc/consumer.mjs release-base /docs
PATH="$PWD/.poc/runtime-bin" jigyll serve --source "$PWD/.poc/release" \
  --host 127.0.0.1 --port 4322 --no-watch
```

Use new consumer names on subsequent runs. `release-build.json` and `release-base-build.json` record the exact tested temporary theme revision/tree, engine version, runtime PATH, and installation/build/serve commands. This proves a standalone installed theme, not an Astro-powered consumer or an internal copied-template demo.

Jigyll 1.10.1's preview server does not strip `baseurl` from incoming requests. The root consumer was served normally by Jigyll. The unchanged `/docs/` build was mounted at its deployment prefix for HTTP checks:

```sh
mkdir -p .poc/host
ln -s ../release-base/_site .poc/host/docs
python -m http.server 4323 --bind 127.0.0.1 --directory .poc/host
```

This is a preview-server limitation, not a claim that `jigyll serve` supports prefix mounting. All fixture links and assets were checked at both origins. A deployed static host must mount the build at its configured prefix.

```sh
npm --prefix tools/poc run capture -- consumer-final http://127.0.0.1:4322
node tools/poc/compare.mjs reference consumer-final
```

The comparison retains unmasked whole-page PNGs and difference images. It reports whole-page, shell/prose, and code-region percentages separately; code rectangles are classified for reporting, not painted over in the artifacts. Page dimensions and every code-block rectangle must match independently of the pixel percentage. `code-regions/` contains 32 reference/consumer/difference crop triples, and `code-tokens.json` retains actual emitted token HTML, classifications, and both-mode colors.

The pinned environment is Chromium 152.0.7977.82 on Linux, DPR/zoom 1, default font size 16px, Liberation Sans prose and Liberation Mono code. `platform.json` adds resolved code-font and installed package evidence to the capture manifests. Stock Starlight and Expressive Code attribution is retained in the shipped license assets.

## Acceptance verdict

**Standalone-theme feasibility is demonstrated for the scoped POC.** The installed consumer passes all 40 shell/prose comparisons at pixelmatch threshold 0.1 and the unchanged 0.1% gate. The largest shell/prose difference is **0.02718%**. All page dimensions and code-block rectangles match. The final consumer's 40 immediate repeats have zero differing pixels, as did the independent reference calibration.

This is **not an exact whole-page pass**: 38/40 whole-page comparisons fall below 0.1%. The two 390×844 code-example captures differ by **0.20774% light** and **0.21660% dark**, with a maximum aggregate code-region difference of **0.54175%**. Native Chroma token boundaries/colors account for the substantive remaining code differences; the unmasked crops also retain small glyph/icon raster differences, including seven differing pixels in each unlabeled block. None are hidden or used to relax the threshold.

The paired copy-state images now retain matching control/feedback geometry and palette, not a token exemption for control layout. Code source, indentation, line breaks, clipboard success/denial, readable both-mode highlighting, typography, padding, backgrounds, and local overflow pass their functional checks. No in-scope functional check remains failed. The `/docs/` preview mounting limitation above remains explicit.

An additional engine edge case is recorded in `heading-id-engine.json`: Jigyll 1.10.1 emits the raw-HTML ID `manual&amp;quoted` as the DOM ID `manual&quotedoted`. The mutation is present in built HTML before theme JavaScript runs. Starlyt preserves and navigates to that emitted ID; it does not repair upstream raw-HTML ID fidelity or substitute its own slug.

[Ticket 16](../.scratch/starlight-theme/issues/16-syntax-fidelity.md) receives the code-token evidence: for example, Chroma emits the entire shell command as one plain span where Shiki distinguishes command/arguments/options. Native CSS cannot recover token boundaries that the renderer does not emit. No replacement renderer or consumer toolchain was introduced.

Post-POC work remains separate: token-fidelity investigation, any upstream heading-metadata integration, broader browsers/devices and accessibility coverage, components, search, and Astro/configuration compatibility. None is claimed by this verdict.

## Review and verification

Reviews ran sequentially. The standards pass corrected HTML escaping for generated URL attributes and Sass import order so the reset layer is registered before the base layer. The spec pass checked tickets 29–35 against the retained evidence and found no remaining scoped requirement gap; it preserved the explicit code-fidelity, no-JavaScript, preview-prefix, and broader-compatibility limitations above.

Final verification includes JavaScript/tooling type checking, Sass compilation, frozen fixture checksum comparison, fresh minimal-PATH Git installations, both-root browser interaction/code/mode scenarios, primary/boundary geometry checks, and a complete 40-case recapture/comparison. `edge-checks.json` additionally covers consumer override precedence, quoted URL/label escaping, explicit/repeated heading IDs, literal labels, and heading-free reading. The temporary browser smoke scripts are not shipped as a new permanent test framework.

The final run passed. All 40 post-review PNGs are byte-identical to the accepted captures, so the retained code-region crops still correspond exactly to the final images. `full-verification.json` records the checks, review outcomes, final capture hashes, and the separate engine observation.
