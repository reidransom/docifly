---
title: Headings and table of contents
permalink: /headings/
---

This page is a working heading example. Use **On this page** to visit its sections, then follow a heading's anchor link to share a location. The H2 and H3 entries are discovered from the rendered article, not from a second hand-maintained outline.

## Choose a heading level

The layout supplies the page H1 from front matter. Write H2 sections and H3 subsections in Markdown:

```markdown
## Plan a page

Explain the goal before the details.

### Gather examples

Use examples readers can try.
```

H2 and H3 headings with IDs appear in the generated table of contents. H4–H6 can have anchor links but are not included in that outline. The page title, sidebar group labels, and the TOC's own title are outside article discovery.

### Link to the rendered ID

Jigyll emits heading IDs. Starlyt reuses them and encodes fragments when making links; it does not invent a separate slug algorithm. To share a generated heading link, copy its rendered anchor URL rather than guessing how punctuation will be converted.

The following repeated headings intentionally share visible text. Follow each **Review** entry in the outline to see the distinct IDs emitted by the engine.

## Author a change

A useful page begins with the reader's goal, shows a complete example, and explains the result. Keep important qualifications next to the example rather than hiding them in another document.

### Review

This first Review belongs to authoring. Read the text for accuracy: does the example use the documented configuration, and does it explain the observable result? It should make sense without knowledge of the theme implementation.

## Publish a change

Build the consumer and preview the result. Long pages should remain navigable through their outline, even when several sections have similar names. That is why the repeated heading below is retained as a useful example.

### Review

This second Review belongs to publishing. Look at the output: can you reach this section directly, does the current-section indication follow your reading, and can you return to the overview of the page?

## An explicit anchor

For an authored stable ID, ordinary HTML can express the heading directly:

```html
<h3 id="release-notes">Release notes</h3>
```

<h3 id="release-notes">Release notes</h3>

This is the rendered heading from that example. [Jump to it](#release-notes), or use its generated outline entry. Keep explicit IDs unique within the page and prefer simple, unambiguous values. Raw HTML passes through the Markdown engine; Starlyt does not repair malformed or engine-transformed IDs.

#### A detail outside the outline

This H4 demonstrates a deeper heading. It can receive a heading anchor, but it does not add another row to the H2/H3 outline. Use deeper levels for details rather than making a table of contents too dense to scan.

## Follow the reading position

Scroll through the article and watch the current section in **On this page**. The top entry, **Overview**, returns to the main reading area. Heading links should place the target below the fixed header rather than hide it behind navigation.

At widths below 72rem—1152 CSS pixels with the default font setting—the outline becomes a disclosure near the top instead of a right-hand rail. Open it and select a section. Selecting a link closes the disclosure and moves focus to the target. Escape or an outside click can also close the disclosure.

## Read without enhancement

With JavaScript disabled, the engine-rendered heading IDs and ordinary fragment links still work. Automatic TOC generation and the added heading-anchor controls are absent. A page with no eligible H2/H3 headings does not display an empty TOC.

The heading-ID behavior belongs to Jigyll; the discover-and-link behavior belongs to Starlyt. See [Theme internals](../internals/) for that division of responsibility.
