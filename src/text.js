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

const { PortableFile } = require(`./file`)

/*
 * TextFile is an util class to read, create and edit text files with
 * various higher-level helper methods.
 *
 * @param name      String  The name of the file to write.
 * @param ext       String  An optional extension of the file.
 * @param linefeed  String  File end-of-line character (default LF)
 */
class TextFile extends PortableFile {
  constructor (encoding, linefeed, indent) {
    super()
    this._encoding = encoding || TextFile.DEFAULT_ENCODING
    this._linefeed = linefeed || TextFile.NEWLINE_FEED
    this._indentSize = indent || TextFile.DEFAULT_INDENT_SIZE
    this._indentLevel = 0
  }

  /*
   * Static read-only attribute for line indent.
   *
   * @return _  String  Whitespace padding.
   */
  get indent () {
    return TextFile.WHITESPACE.repeat(this._indentLevel * this._indentSize)
  }

  /*
   * Static read-only attribute for linefeed.
   *
   * @return _  String  At least one EOL character.
   */
  get linefeed () {
    return this._linefeed
  }

  /*
   * Static read-only attribute for encoding.
   *
   * @return _  String  File encoding (default UTF8).
   */
  get encoding () {
    return this._encoding
  }

  /*
   * High-level wrapper for PortableFile's show method.
   *
   * @return _  String  Complete memory dump to string.
   */
  print () {
    return this.show().toString(this._encoding)
  }

  /*
   * High-level wrapper for PortableFile's puts method. It takes
   * a string and appends it at the end of the memory stack.
   *
   * Throws error if given argument is not a string.
   *
   * @param string  String  Any string.
   * @return _      Uint64  Number of bytes written to memory.
   */
  writeString (string) {
    if (string.toString() !== string) {
      throw new Error(`Unexpected argument of type ${typeof string}, required string`)
    }
    return this.puts(Buffer.from(string))
  }

  /*
   * High-level wrapper for PortableFile's puts method. It takes
   * a string and appends it at the end of the memory stack.
   *
   * Throws error if given argument is not a string or it's
   * length is not equal to a one-length character.
   *
   * @param char  String  A single character or letter.
   * @return _    Uint64  Number of bytes written to memory.
   */
  writeChar (char) {
    if (char.toString() !== char) {
      throw new Error(`Unexpected argument of type ${typeof char}, required string`)
    }
    if (char.length !== TextFile.CHAR_LENGTH) {
      throw new Error(`Cannot write char because it exceeded length ${char.length}`)
    }
    return this.puts(Buffer.from(char))
  }

  /*
   * High-level wrapper for PortableFile's puts method. It takes
   * a string and appends it at the end of the memory stack. It
   * can also add whitespace before the word.
   *
   * Throws error if given argument is not a string or it
   * contains whitespaces.
   *
   * @param word  String  A single word without spacing.
   * @return _    Uint64  Number of bytes written to memory.
   */
  writeWord (word) {
    if (word.toString() !== word) {
      throw new Error(`Unexpected argument of type ${typeof word}, required string`)
    }
    let pos = word.indexOf(TextFile.WHITESPACE)
    if (pos > -1) {
      throw new Error(`Cannot write word because it contains whitespace at ${pos}`)
    }
    if (!this.hasWhitespace()) {
      word = ` ${word}`
    }
    return this.puts(Buffer.from(word))
  }

  /*
   * High-level wrapper for PortableFile's puts method. It takes
   * a string and appends it at the end of the memory stack. It
   * can also add linefeed at the end of the line.
   *
   * Throws error if given argument is not a string or it
   * contains linefeeds.
   *
   * @param line  String  A single line of text without linefeed.
   * @return _    Uint64  Number of bytes written to memory.
   */
  writeLine (line) {
    if (line.toString() !== line) {
      throw new Error(`Unexpected argument of type ${typeof line}, required string`)
    }
    let posN = line.indexOf(TextFile.NEWLINE_FEED)
    if (posN > -1) {
      throw new Error(`Cannot write line because it contains linefeeds (LF) at ${posN}`)
    }
    let posR = line.indexOf(TextFile.CARRIAGE_RETURN)
    if (posR > -1) {
      throw new Error(`Cannot write line because it contains linefeeds (CR) at ${posR}`)
    }
    if (!this.hasWhitespace()) {
      line = ` ${line}`
    }
    if (!line.endsWith(this._linefeed)) {
      line = `${line}${this._linefeed}`
    }
    return this.puts(Buffer.from(line))
  }

  /*
   * Helper method to check if last character written
   * to memory is a whitespace.
   *
   * @return _  Boolean  Whether there's a whitespace or not.
   */
  hasWhitespace () {
    if (this.length === 0) {
      return true // we consider BOF as valid whitespace
    }
    let cursor = this.cursor
    let char = this.move(this.length - 1).read(1) // read last byte
    this.move(cursor) // move cursor back to initial position
    for (let c of TextFile.WHITESPACES_LIST) {
      if (char.toString() === c) {
        return true
      }
    }
    return false
  }

  /*
   * Increase indentation level by one unit.
   * Does not increase if value is above max. allowed uint16.
   *
   * @return _  Uint8  New value of padding.
   */
  incIndent () {
    if (this._indentLevel < 65535) {
      this._indentLevel += 1
    }
    return this._indentLevel
  }

  /*
   * Decrease indentation level by one unit.
   * Does not decrease if value is below zero.
   *
   * @return _  Uint8  New value of padding.
   */
  decIndent () {
    if (this._indentLevel > 0) {
      this._indentLevel -= 1
    }
    return this._indentLevel
  }

  /*
   * Reset indentation level to zero.
   *
   * @return _  Uint8  New value of padding.
   */
  resetIndent () {
    this._indentLevel = 0
    return this._indentLevel
  }

  /*
   * Default indentation size.
   *
   * @return _  Uint8  Line indentation length.
   */
  static get DEFAULT_INDENT_SIZE () {
    return 4
  }

  /*
   * Default string encoding as UTF8.
   *
   * @return _  String  Default encoding.
   */
  static get DEFAULT_ENCODING () {
    return `utf8`
  }

  /*
   * Character size.
   *
   * @return _  Uint8  One character length.
   */
  static get CHAR_LENGTH () {
    return 1
  }

  /*
   * A blank whitespace character.
   *
   * @return _  String  Whitespace character.
   */
  static get WHITESPACE () {
    return ` `
  }

  /*
   * A newline character.
   *
   * @return _  String  Newline character.
   */
  static get NEWLINE_FEED () {
    return '\n'
  }

  /*
   * A carriage return character.
   *
   * @return _  String  Carriage return character.
   */
  static get CARRIAGE_RETURN () {
    return '\r'
  }

  /*
   * A list of valid whitespace characters.
   *
   * @return _  Array  List of characters.
   */
  static get WHITESPACES_LIST () {
    return [' ', '\t', '\n', '\r']
  }
}

module.exports = { TextFile }
