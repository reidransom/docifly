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

## Add a code frame

Jigyll 1.13.0 adds fenced-code UI metadata after the language. A nonempty
double-quoted `title` creates an editor frame for ordinary languages:

```javascript title="site.config.js"
export const theme = "starlyt";
```

An explicit frame does not require a title:

```yaml frame="editor"
theme: starlyt
```

A title infers a terminal frame for `bash`, `sh`, `shell`, `console`,
`powershell`, and `ps1`:

```bash title="Installing dependencies…"
jigyll build --source docs
```

Use `frame="terminal"` to select terminal presentation explicitly:

```console frame="terminal"
$ jigyll --version
```

Use `frame="none"` to retain the existing unframed output:

```json frame="none"
{"frame":false}
```

Explicit `frame` wins over language inference. `title` and `frame` may appear
in either order. Inside their double-quoted values, `\\` represents a literal
backslash and `\"` represents a literal quote:

```text title="A \"quoted\" title with a \\ path and enough additional text to remain bounded on a narrow screen"
The title is outside this copied source.
```

Unknown metadata keeps Jigyll's compatibility behavior and does not create a
frame:

```text future="retained"
This remains an ordinary code block.
```

Malformed recognized metadata fails the build with the source path and line.
Errors include an unquoted or empty title, an unsupported escape, duplicate
`title` or `frame` tokens, an unterminated value, an unsupported frame name,
and combining a title with `frame="none"`.

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

```json title="wide.json"
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

Line markers, line numbers, playgrounds, and Astro/MDX code APIs are not promised by this surface. Use ordinary fences and [documented Markdown](../markdown/) rather than assuming upstream component syntax works here.
