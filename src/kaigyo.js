/*
MIT License

Copyright (c) 2017 anydown

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

For details, see https://github.com/anydown/maildown
*/

var TinySegmenter = require("./tiny_segmenter")

/**
 * Get string length, count full width char as 2
 * @param {string} str 
 */
function charcount(str) {
  len = 0;
  str = escape(str);
  for (i=0;i<str.length;i++,len++) {
    if (str.charAt(i) == "%") {
      if (str.charAt(++i) == "u") {
        i += 3;
        len++;
      }
      i++;
    }
  }
  return len;
}

/**
 * Split a string when line length > 70
 * @param {string} input 
 */
function kaigyo(input){
  var tinySegmenter = new TinySegmenter()
  var segs = tinySegmenter.segment(input);
  
  var result = ""
  var lineLength = 0
  segs.forEach((segment)=>{
    isKinsoku = "、。．，,.".indexOf(segment) >= 0
    var segmentSize = charcount(segment)
    if(segment.indexOf("\n") >= 0){
      lineLength = 0
    }
    if(segmentSize + lineLength > 70 && !isKinsoku){
      result += "\n"
      lineLength = segmentSize
    }
    result += segment
    lineLength += segmentSize
  })
  return result
}

module.exports = kaigyo