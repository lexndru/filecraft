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

const { PortableFile } = require(path.join(__dirname, '..', 'main'))


describe('Portable File', () => {

  describe('Store data, resize and update cursor for append', () => {

    let file = new PortableFile()
    let data = Buffer.from('Work, work!')

    it('should be empty when first initialized', () => {
      assert.equal(file.size(), 0)
    })

    it('should store data and resize it\'s size' , () => {
      let size = file.puts(data)
      assert.equal(size, data.length)
      assert(file.size() > 0)
    })

    it('should have the cursor at a new index' , () => {
      assert.notEqual(file.cursor, 0)
    })

    it('should be able to return data without resetting cursor to 0', () => {
      let cursorPos = file.cursor
      let memdump = file.show()
      assert.deepStrictEqual(memdump, data)
      assert.notEqual(file.cursor, 0)
      assert.equal(file.cursor, cursorPos)
    })

    it('should crash if requested to write non-buffered data', () => {
      assert.throws(() => file.write('it should crash...'))
    })

    it('should wipe out all data', () => {
      let datasize = file.wipe()
      assert.equal(datasize, data.length)
      assert.equal(file.size(), 0)
    })
  })

})
