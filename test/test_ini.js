import * as ini from '../src/ini.js'
import assert from 'assert'
import util from 'util'

function str_eq(expected, actual) {
    assert.equal(util.inspect(expected), actual)
}

function tokchk(str, expected) {
    let lexer = new ini.Lexer(null, str)
    let r = lexer.tokenise()
    str_eq(r, expected)
}

function tokchk_fail(str, error_message) {
    let lexer = new ini.Lexer(null, str)
    assert.throws( () => {
        lexer.tokenise()
    }, error_message)
}

suite('ini', function() {
    setup(function() {
    })

    test('lexer good', function() {
        tokchk(``, '[]')
        tokchk(` `, '[]')
        tokchk(`#`, '[]')
        tokchk(`# `, '[]')
        tokchk(` ;`, '[]')
        tokchk(` ;  `, '[]')
        tokchk(`[a]`, `[ Token { type: 'section', value: 'a', line: 1 } ]`)
        tokchk(`
[a]
`, `[ Token { type: 'section', value: 'a', line: 2 } ]`)
        tokchk(`[a\\
]`, `[ Token { type: 'section', value: 'a', line: 1 } ]`)
        tokchk(` [a]`, `[ Token { type: 'section', value: 'a', line: 1 } ]`)
        tokchk(`[a]
`, `[ Token { type: 'section', value: 'a', line: 1 } ]`)
        tokchk(`[a]
 `, `[ Token { type: 'section', value: 'a', line: 1 } ]`)

        tokchk(`a=`, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: '', line: 1 }
  ]
]`)
        tokchk(` a =  `, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: '', line: 1 }
  ]
]`)
        tokchk(` a\\
 =  `, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: '', line: 1 }
  ]
]`)

        tokchk(`[numero uno]
# primo commento
foo = b a r
baz = qux

;secondo commento
[https://foo.example.org]
1 = true
2 = http://example.com
`, `[
  Token { type: 'section', value: 'numero uno', line: 1 },
  [
    Token { type: 'key', value: 'foo', line: 3 },
    Token { type: 'val', value: 'b a r', line: 3 }
  ],
  [
    Token { type: 'key', value: 'baz', line: 4 },
    Token { type: 'val', value: 'qux', line: 4 }
  ],
  Token { type: 'section', value: 'https://foo.example.org', line: 7 },
  [
    Token { type: 'key', value: '1', line: 8 },
    Token { type: 'val', value: 'true', line: 8 }
  ],
  [
    Token { type: 'key', value: '2', line: 9 },
    Token { type: 'val', value: 'http://example.com', line: 9 }
  ]
]`)

        tokchk(`[a]
foo = bar\\
# comment 1
# comment 2
      b  a  z\\
; comment 3
      qux`, `[
  Token { type: 'section', value: 'a', line: 1 },
  [
    Token { type: 'key', value: 'foo', line: 2 },
    Token { type: 'val', value: 'bar b  a  z qux', line: 2 }
  ]
]`)

        tokchk(`a = "foo"`, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: 'foo', line: 1 }
  ]
]`)
        tokchk(`a = "f'o\\"o b\\sr"`, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: \`f'o"o b r\`, line: 1 }
  ]
]`)
        tokchk(`a = q "w\\" 'e" r 't' "y" u`, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: \`q w" 'e r t y\`, line: 1 }
  ]
]`)
        tokchk(`a = ''`, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: '', line: 1 }
  ]
]`)
        tokchk(`a = ' '`, `[
  [
    Token { type: 'key', value: 'a', line: 1 },
    Token { type: 'val', value: ' ', line: 1 }
  ]
]`)

    })


    test('lexer bad', function() {
        tokchk_fail(`[`, /failed to tokenise/)
        tokchk_fail(`[a`, /failed to tokenise/)
        tokchk_fail(`[a[]`, /failed to tokenise/)
        tokchk_fail(`[a\\[]`, /failed to tokenise/)
        tokchk_fail(`a`, /failed to tokenise/)
        tokchk_fail(`a\\`, /failed to tokenise/)
        tokchk_fail(`=`, /failed to tokenise/)
        tokchk_fail(`!=2`, /failed to tokenise/)
        tokchk_fail(`=2`, /failed to tokenise/)

        tokchk_fail(`[a]
foo = 1\\
# comment

      2`, /Invalid catenation/)
        tokchk_fail(`[a]
foo = 1\\

# comment
      2`, /Invalid catenation/)

    })

})
