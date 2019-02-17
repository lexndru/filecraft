// Copyright (c) 2019 Alexandru Catrina <alex@codeissues.net>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const assert = require('assert')
const path = require('path')

const { FileCraft } = require(path.join(__dirname, '..', 'main'))


let uglyData = `function hello (name) {if (!name) {name = "World"}var message = "Hello, " + name + "!"; console.log("Testing functions in JavaScript")
console.log("1)", hello())
console.log("2)", hello("Alex"))}
` // last newline is important

let prettyData = `function hello (name) {
    if (!name) {
        name = "World";
    }
    var message = "Hello, " + name + "!";
    console.log("Testing functions in JavaScript");
    console.log("1)", hello());
    console.log("2)", hello("Alex"));
}

` // last newline is important

describe('Crafting', () => {

  describe('Write data to file', () => {

    let craft = new FileCraft()
    let file = craft.TextFile()

    it('should be empty when first initialized', () => {
      assert.equal(file.size(), 0)
    })

    it('should be able to save some text', () => {
      file.writeString(`function hello (name) {`)
      file.writeString(`if (!name) {`)
      file.writeString(`name = "World"`)
      file.writeString(`}`)
      file.writeString(`var message = "Hello, " + name + "!";`)
      file.writeLine(`console.log("Testing functions in JavaScript")`)
      file.writeLine(`console.log("1)", hello())`)
      file.writeLine(`console.log("2)", hello("Alex"))}`)
      assert.equal(file.print(), uglyData)
    })

    it('should be able to format text by rules', async () => {

      craft.define('Add newline after semicolon', (feed, ctx) => {
        let semicolon = `;`
        for (let i = 0; i < feed.length; i++) {
          let semicolonEOL = feed[i].indexOf(semicolon)
          if (semicolonEOL > -1) {
            let beforeEOL = feed[i].substring(0, semicolonEOL) + semicolon
            let afterEOL = feed[i].substring(semicolonEOL + semicolon.length)
            feed[i] = beforeEOL
            while (afterEOL.startsWith(' ')) {
              afterEOL = afterEOL.substring(1)
            }
            feed.splice(i+1, 0, afterEOL)
          }
        }
        return feed
      })

      craft.define('Add newline after opening brackets and increase indentation', (feed, ctx) => {
        let openingBrackets = `{`
        for (let i = 0; i < feed.length; i++) {
          let brackets = feed[i].indexOf(openingBrackets)
          if (brackets > -1) {
            let before = feed[i].substring(0, brackets) + openingBrackets
            ctx.incIndent()
            let after = ctx.indent + feed[i].substring(brackets + openingBrackets.length)
            feed[i] = before
            feed.splice(i+1, 0, after)
          }
        }
        return feed
      })

      craft.define('Add newline after closing brackets and decrease indentation', (feed, ctx) => {
        let closingBrackets = `}`
        for (let i = 0; i < feed.length; i++) {
          let brackets = feed[i].indexOf(closingBrackets)
          if (brackets > -1) {
            let before = feed[i].substring(0, brackets)
            ctx.decIndent()
            let after = ctx.indent + feed[i].substring(brackets + closingBrackets.length)
            feed[i] = before + ctx.linefeed + ctx.indent + closingBrackets
            feed.splice(i+1, 0, after)
          }
        }
        return feed
      })

      craft.define('Append semicolon before newlines', (feed, ctx) => {
        for (let i = 0; i < feed.length; i++) {
          let line = feed[i]
          if (!line.trim()) {
            continue
          }
          if (line.endsWith('{') || line.endsWith('}') || line.endsWith(';')) {
            continue
          }
          feed[i] = feed[i] + ';'
        }
        return feed
      })

      craft.define('Correct indentation', (feed, ctx) => {
        ctx.resetIndent()
        for (let i = 0; i < feed.length; i++) {
          let padding = ctx.indent
          if (feed[i].indexOf(`{`) > -1) {
            ctx.incIndent()
          }
          if (feed[i].indexOf(`}`) > -1) {
            ctx.decIndent()
            padding = ctx.indent
          }
          feed[i] = padding + feed[i].trim()
        }
        return feed
      })

      let preview = await craft.preview()
      assert.equal(preview, prettyData)
    })
  })

})
