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


/*
MIT License

Copyright (c) 2017 Minato Sato

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

For details, see https://github.com/satopirka/md2mail
*/

var kaigyo = require("./kaigyo")
var parse = require("markdown-to-ast").parse;
var Syntax = require("markdown-to-ast").Syntax;
var traverse = require("txt-ast-traverse").traverse;
var VisitorOption = require("txt-ast-traverse").VisitorOption;
var WordTable = require("word-table")


function nodeToString(node) {
  var output = ""
  if (node.value) {
    output += node.value
  }
  if (node.children) {
    node.children.forEach((leaf) => {
      output += nodeToString(leaf)
    })
  }
  return output
}

function nodeToUList(node, space) {
  var output = ""
  if (node.value) {
    output += space + "・" + node.value + "\n"
  }
  if (node.children) {
    
    node.children.forEach((leaf) => {
      output += nodeToUList(leaf, space + "　")
    })
  }
  return output
}


/**
 * convert AST to plaintext
 * @param {*} AST
 */
function convert(input) {
  var output = []
  var AST = parse(input);
  var tempTable = []
  var tempTableRow = []

  traverse(AST, {
    enter(node) {
      //console.log("enter", node.type);
      switch (node.type) {
        case Syntax.Document:
          break;
        case Syntax.Paragraph:
          output.push(kaigyo(nodeToString(node)))
          output.push("")
          return VisitorOption.Skip;

        case Syntax.BlockQuote:
          output.push(node.raw)
          return VisitorOption.Skip;

        case Syntax.ListItem:
          //ListItem要素ではolかulか判断出来ないので、上位のListで処理を行っている
          //でも、これだと入れ子要素はレンダリングできなそう（いま出来てない）
          break;

        case Syntax.List:
          var toText = item => item.value
          if (node.ordered) {
            var toItem = (listitem, i) => "　（" + (i + 1) + "）" + nodeToString(listitem) + "\n"
            var listtext = node.children.map(toItem).join("")
            output.push(listtext)
          } else {
            console.log(node);
            var ret = [];
            nodeToUList(node, "").split("\n").forEach(element => {
              ret.push(element.substring(2, element.length));
            });
            output.push(ret.join("\n"));
          }
          return VisitorOption.Skip;

        case Syntax.Header:
          output.push("")
          if (node.depth === 1) {
            output.push("【" + node.children.map(item => item.value).join("") + "】")
          }
          if (node.depth >= 2) {
            output.push("■" + node.children.map(item => item.value).join("") + "")
          }
          output.push("")
          return VisitorOption.Skip;

        case Syntax.CodeBlock:
          output.push(nodeToString(node))
          output.push("")
          break;

        case Syntax.Html:
          output.push(nodeToString(node))
          output.push("")
          break;

        case Syntax.ReferenceDef:
          break;

        case Syntax.HorizontalRule:
          output.push("========================================")
          break;

        case Syntax.Str:
          break;

        case Syntax.Break:
          break;

        case Syntax.Emphasis:
          break;

        case Syntax.Strong:
          break;

        case Syntax.Html:
          break;

        case Syntax.Link:
          break;

        case Syntax.Image:
          break;

        case Syntax.Code:
          break;

        case "table":
          tempTable = []
          break;
        case "tableCell":
          tempTableRow.push(nodeToString(node))
        default:
          break;
      }
    },
    leave(node) {
      switch (node.type) {
        case "table":
          var wt = new WordTable(tempTable[0],tempTable.slice(1));
          output.push(wt.string())
          output.push("")
          
        case "tableRow":
          tempTable.push(tempTableRow)
          tempTableRow = []
        default:
          break;

      }
    }
  });
  return output.join("\n")
}

module.exports = convert