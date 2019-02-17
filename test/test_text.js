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

const { TextFile } = require(path.join(__dirname, '..', 'main'))


describe('Plain Text File', () => {

  describe('Store ASCII text', () => {

    let file = new TextFile()
    let data1 = `I'm acting on instinct`
    let data2 = `On the prowl`

    it('should be empty when first initialized', () => {
      assert.equal(file.size(), 0)
    })

    it('should store and append data as strings' , () => {
      file.writeString(data1)
      file.writeString(data2)
      assert.equal(file.print(), data1 + data2)
    })

    it('should add new lines of data' , () => {
      let oldData = file.print()
      file.writeString('\n')
      file.writeLine(data1)
      file.writeLine(data2)
      assert.equal(file.print(), oldData + '\n' + data1 + '\n' + data2 + '\n')
    })

    it('should crash if requested to write multilines data as line', () => {
      assert.throws(() => file.writeLine(data1 + '\n\n' + data2))
    })

    it('should crash if requested to write data with whitespace as word', () => {
      assert.throws(() => file.writeWord(data1))
    })
  })

  describe('Store unicode text', () => {

    let file = new TextFile()
    let data = `copyright ©`

    it('should be empty when first initialized', () => {
      assert.equal(file.size(), 0)
    })

    it('should be able to store unicodes', () => {
      file.writeString(data)
      assert.equal(file.print(), data)
    })

    it('should store multibytes unicode and prepend whitespace', () => {
      let unicodeChar = `🐈`
      file.writeWord(unicodeChar)
      assert.equal(file.print(), data + ' ' + unicodeChar)
    })
  })

})
