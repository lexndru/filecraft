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

/*
 * BytesArray is an util class to arrange bytes on an array-like stack memory.
 *
 * @param cursor  Uint64  Indexed step into buffered memory.
 * @param length  Uint64  Total length of the data in memory.
 * @param buffer  Buffer  Dynamic buffer for data storage.
 */
class BytesArray {
  constructor () {
    this._cursor = 0
    this._length = 0
    this._buffer = Buffer.alloc(0)
  }

  /*
   * Internal buffer read-only attribute.
   */
  get memory () {
    return this._buffer
  }

  /*
   * Internal memory length read-only attribute.
   */
  get length () {
    return this._length
  }

  /*
   * Internal memory cursor read-only attribute.
   */
  get cursor () {
    return this._cursor
  }

  /*
   * Reallocate memory of internal buffer storage.
   *
   * @param size  Uint64  The new dimension to reallocate.
   * @return dim  Uint64  Byte length of the reallocated data.
   */
  resize (size) {
    let size_ = parseInt(size)
    if (isNaN(size_)) {
      throw new Error(`Unexpected argument of type ${typeof size}, required unsigned integer`)
    }
    let buf = Buffer.alloc(size)
    let dim = this._buffer.copy(buf)
    this._buffer = buf
    if (this._length > size) {
      this._length = size
    }
    return dim
  }

  /*
   * Read real size of stack.
   *
   * @return _  Uint64  Byte length of the internal memory.
   */
  size () {
    return this._buffer.byteLength
  }

  /*
   * Move cursor at given index.
   *
   * @param index  Uint64  New position of cursor.
   * @return this  Object  Self-instance.
   */
  move (index) {
    let index_ = parseInt(index)
    if (isNaN(index_)) {
      throw new Error(`Unexpected argument of type ${typeof index}, required unsigned integer`)
    }
    if (index_ < 0) {
      throw new Error(`Index must be a positive number`)
    }
    if (index_ > this._length) {
      throw new Error(`Index cannot exceed current stack length`)
    }
    this._cursor = index_
    return this
  }

  /*
   * Read an amount of bytes from memory buffer starting from
   * the index of the cursor.
   *
   * Zero-filled padding is added if the required amount of
   * bytes exceeds the total length of data from memory.
   *
   * @param bytes  Uint64  Total bytes to read.
   * @return buff  Buffer  A slice from the internal buffer.
   */
  read (bytes) {
    let bytes_ = parseInt(bytes)
    if (isNaN(bytes_)) {
      throw new Error(`Unexpected argument of type ${typeof bytes}, required unsigned integer`)
    }
    let padding = 0
    if (bytes_ > this._length) {
      padding = bytes_ - this._length
      bytes_ = this._length
    }
    let buff = Buffer.alloc(bytes_ + padding)
    this._buffer.slice(this._cursor, this._cursor + bytes_).copy(buff, 0)
    return buff
  }

  /*
   * Write given buffer to internal buffer or throw an
   * error for any other datatype. Internal buffer can
   * be resized during operation.
   *
   * @param buff  Buffer  Buffer data to write to memory.
   * @return _    Uint64  Total bytes of data copied to memory.
   */
  write (buff) {
    if (buff instanceof Buffer) {
      if (buff.byteLength + this.length > this.size()) {
        this.resize(this.size() + buff.byteLength * 2)
      }
      let dim = buff.copy(this._buffer, this._cursor)
      let off = this._cursor + dim
      if (off > this._length) {
        this._length += off - this._length
      }
      return dim
    }
    throw new Error(`Unexpected argument of type ${typeof buff}, required buffer instance`)
  }
}

module.exports = { BytesArray }
