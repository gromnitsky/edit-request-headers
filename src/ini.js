export class Token {
    constructor(type, value, raw, line) {
        this.type = type
        this.value = value
        this.raw = raw
        this.line = line
    }
}

function err(input, line, msg) {
    let coords = [input, line, 1].filter(Boolean).join`:`
    return new Error([coords, msg].join`: `)
}

export class Lexer {
    static TOKEN_TYPES = [
        ['newline', /\n/ ],
        ['comment', /[;#][^\n]*/ ],
        ['section', /\[\s*([^\][\n]+)\s*\]/ ],
        ['key', /[a-zA-Z0-9_.-]+/],
        ['op', /=/],
        ['value-quoted-double', /"([^"\\\n]*(\\.[^"\\\n]*)*)"/],
        ['value-quoted-single', /'([^'\\\n]*(\\.[^'\\\n]*)*)'/],
        ['value', /[^\n]+(?=\\\n)/],
        ['backslash-eol', /\\\n/],
        ['value', /[^\n]+/],
    ]

    constructor(file, str) {
        this.file = file
        this.str = str || ''
        this.pos = 0
        this.line = 1
    }

    err(msg) { throw err(this.file, this.line, msg) }

    tokenise() {
        let tokens = []
        let str = this.str
        let left_trim = true
        let backslash_mode, prev_token

        while (str.length > 0) {
            let token = this.token(str, left_trim); if (!token) {
                this.err(`Failed to match token on \`${str.slice(0,20)}…\``)
            }
            if (['backslash-eol','newline'].includes(token.type)) this.line += 1
            left_trim = true

            if (backslash_mode) {
                switch (token.type) {
                case 'newline':
                    if (['backslash-eol','newline'].includes(prev_token.type)) {
                        this.err(`Invalid catenation: newline after ${prev_token.type}`)
                    }
                    break
                case 'comment': // do nothing
                    break
                default:
                    token.type = 'value'
                    token.value = ' ' + token.raw
                    backslash_mode = false
                }

            } else if (token.type === 'key' && prev_token?.type === 'op') {
                token.type = 'value'
//                token._d = 1
                left_trim = false

            } else if (token.type === 'backslash-eol') {
                backslash_mode = true
            }

            delete token.raw
            tokens.push(token)
            prev_token = token
            str = this.str.slice(this.pos)
        }

        return tokens
    }

    token(str, left_trim) {
        if (left_trim) {
            let m = str.match(/^[ \t]+/); if (m) {
                this.pos += m[0].length
                str = this.str.slice(this.pos)
                if (!str.length)
                    return new Token('space-trailing', m[0], m[0], this.line)
            }
        }

        for (let [type, regexp] of Lexer.TOKEN_TYPES) {
            let re = new RegExp('^' + regexp.source)
            let m; if ( (m = str.match(re))) {
                this.pos += m[0].length
                return new Token(type, m[1] ?? m[0], m[0], this.line)
            }
        }
    }
}
