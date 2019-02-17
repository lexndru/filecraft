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

const { BytesArray } = require(path.join(__dirname, '..', 'main'))


describe('Memory Data', () => {

  describe('Store some bytes of data', () => {

    let data = Buffer.from('Ready to work')
    let bytes = new BytesArray()

    it('should be empty when first initialized', () => {
      assert.equal(bytes.length, 0)
    })

    it('should store data and resize it\'s size' , () => {
      bytes.write(data)
      assert.equal(bytes.length, data.length)
    })

    it('should keep the cursor at 0 index' , () => {
      assert.equal(bytes.cursor, 0)
    })

    it('should be able to return data "AS IS"', () => {
      let raw = bytes.read(bytes.length)
      assert.deepStrictEqual(raw, data)
    })

    it('should be able to return only last 4 bytes', () => {
      bytes.move(data.length - 4)
      assert.equal(bytes.read(4).length, 4)
    })

    it('should crash if requested to write non-buffered data', () => {
      assert.throws(() => bytes.write('it should crash...'))
    })

    it('should crash if cursor is moved over memory length', () => {
      assert.throws(() => bytes.move(data.length + 1))
    })

    it('should return null padded if requested to read large set', () => {
      let padd = Buffer.alloc(4)
      bytes.move(data.length - 1)
      let lastByte = bytes.read(1).copy(padd)
      let paddedBytes = bytes.read(4)
      assert.deepStrictEqual(paddedBytes, padd)
    })
  })

  describe('Resize allocated memory', () => {

    let bytes = new BytesArray()

    it('should be zero-length when initialized', () => {
      assert.equal(bytes.size(), 0)
    })

    it('should be able to resize to 16 bytes', () => {
      bytes.resize(16)
      assert.equal(bytes.size(), 16)
    })

    it('should be able to auto-resize on write', () => {
      let data = Buffer.from('x'.repeat(24))
      let oldSize = bytes.size()
      bytes.write(data)
      let newSize = bytes.size()
      assert(newSize > oldSize)
    })

    it('should return number of bytes when writting', () => {
      let data = Buffer.from('x'.repeat(64))
      let dim = bytes.write(data)
      assert.equal(dim, 64)
    })

    it('should have size greather or equal than length', () => {
      assert(bytes.size() >= bytes.length)
    })
  })


  describe('Write, append and delete', () => {

    let bytes = new BytesArray()

    it('should read null values when initialized', () => {
      assert.deepStrictEqual(bytes.read(16), Buffer.alloc(16))
    })

    it('should write and auto-resize', () => {
      let data = Buffer.from('x'.repeat(16))
      bytes.write(data)
      assert.deepStrictEqual(bytes.read(16), data)
    })

    it('should append and auto-resize', () => {
      let oldData = Buffer.from('x'.repeat(16))
      let newData = Buffer.from('X'.repeat(32))
      bytes.move(16)
      bytes.write(newData)
      bytes.move(0)
      let memdump = bytes.read(16 + 32)
      let buf = Buffer.concat([oldData, newData])
      assert.deepStrictEqual(memdump, buf)
    })

    it('should overwrite starting from index 0 without resize', () => {
      let junkData = Buffer.from('?'.repeat(32))
      let goodData = Buffer.from('X'.repeat(16))
      bytes.move(0).write(junkData)
      let memdump = bytes.read(bytes.length)
      let buf = Buffer.concat([junkData, goodData])
      assert.deepStrictEqual(memdump, buf)
    })

    it('should overwrite starting from index 20 without resize', () => {
      let junkData = Buffer.from('.'.repeat(12))
      let oldData1 = Buffer.from('?'.repeat(32))
      let oldData2 = Buffer.from('X'.repeat(16))
      bytes.move(20).write(junkData)
      bytes.move(0)
      let memdump = bytes.read(bytes.length)
      junkData.copy(oldData1, 20)
      let buf = Buffer.concat([oldData1, oldData2])
      assert.deepStrictEqual(memdump, buf)
    })

    it('should delete on resize', () => {
      bytes.resize(8)
      assert.deepStrictEqual(bytes.size(), 8)
      let data = Buffer.from('?'.repeat(8))
      let memdump = bytes.move(0).read(bytes.length)
      assert.deepStrictEqual(memdump, data)
    })
  })

})
