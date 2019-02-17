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
for (let w of text) {
    file.writeWord(w)
}

// closing document by append text...
file.writeString('</content></document>')
```

Without an explicit set of rules, FileCraft would output the data "AS IS", and in this case would probably look like this:
```
<document>
<title>Some title goes here</title>
<content>
Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</content></document>
```
