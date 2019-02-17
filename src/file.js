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

const { BytesArray } = require(`./array`)

/*
 * An interface to read, create and edit files with BytesArray.
 */
class PortableFile extends BytesArray {
  /*
   * Static read-only attribute for file size.
   *
   * @return _  Uint64  Total memory length.
   */
  get filesize () {
    return this.size()
  }

  /*
   * BytesArray's read method wrapper to read all data.
   *
   * @return _  Buffer  Buffered data from memory.
   */
  show () {
    let cursor = this.cursor
    let bytes = this.move(0).read(this.length)
    this.move(cursor)
    return bytes
  }

  /*
   * BytesArray's write method wrapper to write data and move
   * cursor ahead.
   *
   * @param buff  Buffer  Any buffer.
   * @return _    Uint64  Number of bytes written to memory.
   */
  puts (buff) {
    let dim = this.write(buff)
    dim += this.cursor
    this.move(dim)
    return dim
  }

  /*
   * Destroy stored data by shrinking it's internal memory.
   *
   * @return _  Uint64  Number of bytes erased from memory.
   */
  wipe () {
    let dim = this.length
    this.resize(0)
    return dim
  }
}

module.exports = { PortableFile }
