# FileCraft
[![Build Status](https://travis-ci.org/lexndru/filecraft.svg?branch=master)](https://travis-ci.org/lexndru/filecraft)

FileCraft is a Node.js module to create and alter file contents programmatically, while following certain flows and filters.

## Install from npm
```
$ npm install filecraft --save
```

## Install from sources
```
$ npm pack
$ npm install .
```

## Quick test
```
$ node
> const { FileCraft } = require('filecraft')
> console.log(FileCraft)
```

## What is FileCraft?
FileCraft is a Node.js module to create and alter file contents. It is useful when one would want to generate content for a file, but there are some conditions to obtain its content and later on there must be applied some filters onto the content itself.

The module allows an user to craft the content rather than just dumping it into a file. Crafting accepts a set of rules and filters that are applied to the data and the final output is shaped by these user-defined rules.


## Getting started with an example
In this example, FileCraft works on a badly formatted XML file (by bad I mean ugly formatted, not corrupted or incomplete). The content results from some flow control statements, but the crafting rules are defined by the user.

Crafting rules:
- Always add a space after a punctuation sign (e.g. 'Here.You are here.' --> 'Here. You are here. ');
- Add a newline after each XML tag;
- Nicely indent nested XML tags.

```
const { FileCraft } = require('filecraft')

let craft = new FileCraft()
let file = craft.TextFile('document', 'xml')

// write line will append linefeed at the end of the text
file.writeLine('<document>')

// and it also check if it begins with a whitespace
file.writeLine('<title>Some title goes here</title>')
file.writeLine('<content>')

// write string doesn't care about linefeeds or whitespace
file.writeString('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.')

// it just appends text...
file.writeString('Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')

// you can loop through a string and write word by word
let text = 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
for (let w of text.split(' ')) {
    file.writeWord(w)
}

// closing document by append text...
file.writeLine('</content></document>')

// print file content
console.log(file.print())
```

Without an explicit set of rules, FileCraft would output the data "AS IS", and in this case would probably look like this:
```
<document>
<title>Some title goes here</title>
<content>
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</content></document>
```

#### Crafting rule #1: always add a space after a punctuation sign
FileCraft must know how to handle such filter and alter `[...] aliqua.Ut enim [...]` to `[...] aliqua. Ut enim [...]`.

The first parameter is a human-readable text to understand the rule. The second parameter is a callback with two acceptable parameters: a feed and a context. The feed is the content of the file, as an array, divided by linefeed; while the second one is the context of the feed, in this case the actual file instance. The callback must always return the feed, otherwise it is ignored.

```
craft.define(`always add a space after a punctuation sign`, (feed, ctx) => {
  for (let i = 0; i < feed.length; i++) {
    if (feed[i].indexOf('.') > -1) {
      let pct = feed[i].indexOf('.')
      if (feed[i].charAt(pct + 1) != ' ') {
        let before = feed[i].substring(0, pct)
        let after = feed[i].substring(pct + 1)
        feed[i] = before + '. ' + after
      }
    }
  }
  return feed
})
```

#### Crafting rule #2: add a newline after each XML tag
The previous rule could ignore the `ctx` entierly since it doesn't need it. This rule however does. FileCraft must know what is the linefeed accepted by the file and how it can transform: `[...] laborum.</content></document>` into something better.

```
craft.define(`add a newline after each XML tag`, (feed, ctx) => {
  for (let i = 0; i < feed.length; i++) {
    let tagsClash = feed[i].search(/\>\<\/[a-z]+/)
    let before = feed[i].substring(0, tagsClash + 1)
    let after = feed[i].substring(tagsClash + 1)
    feed[i] = before + ctx.linefeed + after
  }
  return feed
})
```

#### Crafting rule #3: nicely indent nested XML tags
A text file instance has a `ctx.indent` read-only attribute and three methods to control indentation: `incIndent()`, `decIndent()` and `resetIndent()`. The filter checks whether the line is an opening tag or a closing tag and controls the indentation level.

```
craft.define(`nicely indent nested XML tags`, (feed, ctx) => {
  ctx.resetIndent()
  for (let i = 0; i < feed.length; i++) {
    let indent = ctx.indent
    if (feed[i].match(/<[a-z]+>/)) {
      ctx.incIndent()
    }
    if (feed[i].match(/<\/[a-z]+>/)) {
      ctx.decIndent()
      indent = ctx.indent
    }
    feed[i] = indent + feed[i]
  }
  return feed
})
```

*Note:* Please note that these rule definitions and implementations are far from being optimal. Do not rely on these examples in a real-world usage. Write your own definitions and ideally implement them as generic as possible.

#### Preview output and save to file
```
// get complete file content, without filters/rules applied
let rawContent = file.print()

// get complete file content as bytes
let bytes = file.show()

// get final output with all filters/rules applied
let output = await craft.preview()

// write to file (first param is filename and second param is file ext)
craft.saveAs('document', 'xml')
```


#### Crafting result
```
<document>
    <title>Some title goes here</title>
    <content>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</content>
</document>
```


## License
Copyright 2019 Alexandru Catrina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
