---
title: Code blocks
permalink: /code/
---

Fenced code is rendered by Jigyll and highlighted by Chroma. Starlyt styles that output and adds a clipboard control when the browser supports it. The blocks on this page are the examples themselves, not a separate test fixture.

## Author a fenced block

Use a language name after the opening fence when you want highlighting:

````markdown
```yaml
title: My documentation
baseurl: ""
```
````

The rendered result:

```yaml
title: My documentation
baseurl: ""
```

Compare the two blocks: copying the outer example includes the Markdown fence, while copying the YAML block yields only its code text.

## Preserve whitespace

Copy the following Python into a plain text editor. Indentation, the blank line, and the source's line breaks should remain intact:

```python
def greeting(name):
    message = f"Hello, {name}"
    return message

print(greeting("Starlyt"))
```

Starlyt reads the rendered `code.textContent` for copying. It does not trim the text, reconstruct it from colored spans, or include the copy button's label. What matters is the code a reader can paste, not the highlighter's internal token markup.

## Keep long lines local

This deliberately long JSON line is useful for inspecting horizontal scrolling inside a block. Scroll the block rather than widening the entire document:

```json
{"site":"Starlyt","workflow":["write ordinary Markdown","install the theme through Jigyll","build the separate consumer","read the generated documentation","try the navigation and clipboard controls at a narrow window width"],"automatedTesting":false}
```

The copy control should remain usable even when the code extends beyond the visible block. Use a keyboard to reach the block and its control as well as a pointer.

## Plain code

A fence without a language is also valid:

```
Write
  Build
    Read
```

Plain code should remain readable in Dark and Light modes. Highlighting does not add meaning to every kind of text, and a language label should describe the source rather than be chosen only for its colors.

## Clipboard availability

The control is called **Copy to clipboard**. It becomes available with JavaScript and the browser Clipboard API, normally on HTTPS or a trustworthy local origin such as `http://127.0.0.1`.

When writing succeeds, the feedback is **Copied!**. If the browser rejects the write, it is **Copy failed**; failure must not be presented as success. When the Clipboard API is unavailable, there is no copy button. You can still select and copy text normally.

Try copying a block and pasting it into an editor. If your browser allows per-site clipboard permissions, denying access is a useful optional way to inspect the failure message. There is no requirement to automate that check.

## Highlighting scope

Chroma's token boundaries and colors can differ from the highlighter used by stock Starlight. Readable highlighting is not proof of exact syntax-token visual parity. The theme does not replace Jigyll's renderer to recover token distinctions it never emitted.

Code titles, line numbers, markers, playgrounds, and Astro/MDX code APIs are not promised by this surface. Use ordinary fences and [documented Markdown](../markdown/) rather than assuming upstream component syntax works here.
