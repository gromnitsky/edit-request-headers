/*
  Spec: https://www.freedesktop.org/software/systemd/man/255/systemd.syntax.html
*/

export class Token {
    constructor(type, value, line) {
        this.type = type
        this.value = value
        this.line = line
    }
}

function err(input, line, msg) {
    let coords = [input || '[memory]', line, 1].join`:`
    return new Error([coords, msg].join`: `)
}

export class Lexer {
    static TOKEN_TYPES_PASS1 = [
        ['comment', /[;#][^\n]*\n/ ],
        ['data', /[^\n]+(?=\\\n)/],
        ['backslash-eol', /\\\n/],
        ['data', /[^\n]+/],
        ['newline', /\n[ \t]*/ ],
    ]
    static STR_RE = /"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g

    constructor(file, str) {
        this.str = str ? (str + "\n") : ''
        this.pos = 0
        this.line = 1
        this.file = file
    }

    err(msg) { throw err(this.file, this.line, msg) }

    tokenise_pass1() {
        let tokens = []
        let str = this.str

        while (str.length > 0) {
            let token = this.token(str); if (!token) {
                this.err(`Failed to match token on \`${str.slice(0,20)}…\``)
            }
            if (['comment', 'backslash-eol','newline'].includes(token.type))
                this.line += 1

            tokens.push(token)
            str = this.str.slice(this.pos)
        }

        return tokens
    }

    filter_pass1(tokens) {
        let r = []
        let backslash_mode, prev_node
        for (let t of tokens) {
            if (t.type === 'comment') continue

            if (backslash_mode) {
                if (t.type !== 'data') this.err('Invalid catenation')
                prev_node.value = prev_node.value + ' ' + t.value
                backslash_mode = false
                continue
            } else if (t.type === 'newline' || t.type === 'spaces') {
                continue
            } else if (t.type === 'backslash-eol') {
                backslash_mode = true
                continue
            }

            r.push(t)
            prev_node = t
        }
        return r
    }

    token(str) {
        let m = str.match(/^[ \t]+/); if (m) { // left trim
            this.pos += m[0].length
            str = this.str.slice(this.pos)
            if (!str.length) return new Token('spaces', m[0], this.line)
        }

        for (let [type, regexp] of Lexer.TOKEN_TYPES_PASS1) {
            let re = new RegExp('^' + regexp.source)
            let m; if ( (m = str.match(re))) {
                this.pos += m[0].length
                return new Token(type, m[1] ?? m[0], this.line)
            }
        }
    }

    tokenise() {
        let tp1 = this.tokenise_pass1()
        let fp1 = this.filter_pass1(tp1)

        let tokens = []
        for (let token of fp1) {
            let m, t
            this.line = token.line
            let text = token.value.trim()

            if ( (m = text.match(/^\[([^\][]+)\]$/))) {
                t = new Token('section', m[1].trim(), this.line)
            } else if ( (m = text.match(/^([a-zA-Z0-9._-]+)\s*=\s*(.*)/))) {
                t = [
                    new Token('key', m[1], this.line),
                    new Token('val', unpack_quoted_strings(m[2]), this.line)
                ]
            }

            if (!t)
                this.err(`failed to tokenise \`${token.value.slice(0,20)}…\``)
            tokens.push(t)
        }

        return tokens
    }
}

function unpack_quoted_strings(str) {
    let r = []
    let matches = [...str.matchAll(Lexer.STR_RE)]
    for (let idx = 0; idx < matches.length; idx++) {
        let cur = matches[idx]
        if (!r.length) r.push(str.slice(0, cur.index))
        let val = cur[1] ?? cur[2]
        r.push(val)
        let next = matches[idx+1]
        if (next) r.push(str.slice(cur.index+cur[0].length, next.index))
    }

    return unescape(r.length ? r.join`` : str)
}

// TODO: add
// "\xxx"	character number xx in hexadecimal encoding
// "\nnn"	character number nnn in octal encoding
// "\unnnn"	unicode code point nnnn in hexadecimal encoding
// "\Unnnnnnnn"	unicode code point nnnnnnnn in hexadecimal encoding
function unescape(str) {
    if (!str) return str
    return str.replace(/\\([abfnrtv\\"'s])/g, (_, ch) => {
        return {
            'a' : '<bell>',         // FIXME
            'b' : '\b;',
            'f' : '\f',
            'n' : '\n',
            't' : '\t',
            'v' : '\v',
            '\\': '\\',
            "'" : "'",
            '"' : '"',
            's' : ' ',
        }[ch]
    })
}

export let LINE = Symbol('line')

export function parse(tokens, opt) {
    opt = opt || { // TODO
        booleans: false,
        numbers: false,
        time: false
    }

    let r = {}
    let section
    tokens.forEach( (token, idx) => {
        if (0 === idx && Array.isArray(token)) {
            throw err(null, token[0].line, 'No section')
        }

        if (Array.isArray(token)) {
            let newval = {
                [LINE]: token[0].line,
                value: tr(token[1].value, opt)
            }
            let prev = section[token[0].value]
            if (prev) {
                prev[LINE] = newval[LINE]
                if ('' === newval.value) {
                    prev.value = ''
                } else if (Array.isArray(prev.value)) {
                    prev.value.push(newval.value)
                } else {
                    prev.value = [prev.value, newval.value]
                }
            } else {
                section[token[0].value] = newval
            }

        } else {
            section = r[token.value] = {
                [LINE]: token.line
            }
        }
    })
    return r
}

// TODO
// * booleans /1|yes|true|on/ and /0|no|false|off/
// * numbers
// * time
function tr(str, opt) {
    return str
}
