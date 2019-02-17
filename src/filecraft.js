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

const fs = require('fs')

const { PortableFile } = require(`./file`)
const { TextFile } = require(`./text`)

/*
 * FileCraft is an implementation of a simple contept to create and
 * alter files syntax programmatically.
 *
 * @param file  PortableFile  An instance of the PortableFile base-class.
 * @param name  String        Name of the file to save.
 * @param ext   String        File extension (optional).
 * @param rules Map           Map of rules definitions to alter file data.
 */
class FileCraft {
  constructor (name, ext) {
    this._file = null
    this._name = name || ''
    this._ext = ext || ''
    this._rules = new Map()
  }

  /*
   * Getter for current assigned file.
   *
   * Throws an error if file is not an instance of PortableFile.
   *
   * @return _  Object  File instance.
   */
  get context () {
    if (this._file instanceof PortableFile) {
      return this._file
    }
    throw new Error(`Cannot return context of an unset file`)
  }

  /*
   * Define a rule to process stored data before final output.
   *
   * Throws error if rule alias is duplicated.
   *
   * @param alias     String    An alias or short description of the rule.
   * @param callback  Function  Rule definition with feed and context as params.
   * @return _        Object    Self instance.
   */
  define (alias, callback) {
    if (this._rules.has(alias)) {
      throw new Error(`An alias rule of ${alias} already exists`)
    }
    this._rules.set(alias, callback)
    return this
  }

  /*
   * Asynchronous write from memory to file.
   *
   * Throws error if filename is missing or is not a string; same
   * for extension if provided, otherwise it's optional.
   *
   * @param name  String   The name of the file to write.
   * @param ext   String   An optional extension of the file.
   * @return _    Promise  A promise without data on success.
   */
  async saveAs (name, ext) {
    if (name && name.toString() !== name) {
      return Promise.reject(new Error(`File name must be non-empty string`))
    }
    if (ext) {
      if (ext.toString() !== ext) {
        return Promise.reject(new Error(`File extension must be string`))
      }
      if (ext.length > 0) {
        name += `.${ext}`
      }
    }
    let mode = 0o644
    let encoding = this.context.encoding
    let data = await this.process()
    return new Promise((resolve, reject) => {
      fs.writeFile(name, data, { encoding, mode }, e => e ? reject(e) : resolve())
    })
  }

  /*
   * Asynchronous write from memory to file, but without params.
   *
   * @return _  Promise  A promise without data on success.
   */
  async save () {
    return this.saveAs(this._name, this._ext)
  }

  /*
   * Preview output with all rules/filters applied to data.
   *
   * @return _  String  Final processed output.
   */
  async preview () {
    let output = await this.process()
    return output
  }

  /*
   * Process and apply all defined rules onto file data. If no rule is
   * defined, then data is untouched.
   *
   * Throws an error if file hasn't been initialized.
   *
   * @return _  String  Valid unicode content.
   */
  async process () {
    if (this._file instanceof PortableFile) {
      let data = this.context.print()
      let linefeed = this.context.linefeed
      let datafeed = data.split(linefeed)
      if (this._rules.size > 0) {
        let textfeed = ''
        for (let check of this._rules.values()) {
          if (textfeed.length > 0) {
            datafeed = textfeed.split(linefeed)
          }
          datafeed = await check(datafeed, this.context) || datafeed
          textfeed = datafeed.join(linefeed).toString()
        }
        return textfeed
      } else {
        return data
      }
    }
    throw new Error(`Cannot process an uninitialized file`)
  }

  /*
   * Create new instance of TextFile and initialize it.
   *
   * @param name  String    Name of the file, used later on save (optional)
   * @param ext   String    File extension, used later on save (optional)
   * @return _    TextFile  Instance of TextFile.
   */
  TextFile (name, ext) {
    this._file = new TextFile()
    this._name = name || ''
    this._ext = ext || ''
    return this._file
  }

  /*
   * Read-only getter for TextFile class-object.
   *
   * @return _  Object  TextFile class-object.
   */
  get Text () {
    return TextFile
  }
}

module.exports = { FileCraft }
