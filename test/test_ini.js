import * as ini from '../src/ini.js'
import assert from 'assert'
import util from 'util'

suite('ini', function() {
    setup(function() {
    })

    test('lexer valid 1', function() {
        let lexer = new ini.Lexer('[test]', ` # comment
 [ Section A]
 KeyOne = " value 1"
KeyTwo= value 2`)
        let r = lexer.tokenise()
//        console.log(r)
        assert.equal(util.inspect(r), `[
  Token { type: 'comment', value: '# comment', line: 1 },
  Token { type: 'newline', value: '\\n', line: 1 },
  Token { type: 'section', value: 'Section A', line: 2 },
  Token { type: 'newline', value: '\\n', line: 2 },
  Token { type: 'key', value: 'KeyOne', line: 3 },
  Token { type: 'op', value: '=', line: 3 },
  Token { type: 'value-quoted-double', value: ' value 1', line: 3 },
  Token { type: 'newline', value: '\\n', line: 3 },
  Token { type: 'key', value: 'KeyTwo', line: 4 },
  Token { type: 'op', value: '=', line: 4 },
  Token { type: 'value', value: 'value', line: 4 },
  Token { type: 'value', value: ' 2', line: 4 }
]`)
    })

    test('lexer valid 2', function() {
        let lexer = new ini.Lexer('[test]', `[Section A]
One = q w e
Two = foo 1\\
# comment
         'bar 2' \\
         [baz] `)
        let r = lexer.tokenise()
//        console.log(r)
        assert.equal(util.inspect(r), `[
  Token { type: 'section', value: 'Section A', line: 1 },
  Token { type: 'newline', value: '\\n', line: 1 },
  Token { type: 'key', value: 'One', line: 2 },
  Token { type: 'op', value: '=', line: 2 },
  Token { type: 'value', value: 'q', line: 2 },
  Token { type: 'value', value: ' w e', line: 2 },
  Token { type: 'newline', value: '\\n', line: 2 },
  Token { type: 'key', value: 'Two', line: 3 },
  Token { type: 'op', value: '=', line: 3 },
  Token { type: 'value', value: 'foo', line: 3 },
  Token { type: 'value', value: ' 1', line: 3 },
  Token { type: 'backslash-eol', value: '\\\\\\n', line: 3 },
  Token { type: 'comment', value: '# comment', line: 4 },
  Token { type: 'newline', value: '\\n', line: 4 },
  Token { type: 'value', value: " 'bar 2'", line: 5 },
  Token { type: 'backslash-eol', value: '\\\\\\n', line: 5 },
  Token { type: 'value', value: ' [baz]', line: 6 },
  Token { type: 'space-trailing', value: ' ', line: 6 }
]`)
    })

})
