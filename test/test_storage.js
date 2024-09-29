import * as storage from '../src/storage.js'
import assert from 'assert'

suite('storage', function() {
    setup(function() {
    })

    test('smoke', function() {
        assert.throws( () => { storage.ini_parse('bad') })
        let r = storage.ini_parse('[q]\nW=1\n[https://w]\nq=2\ne=3\nr =   \n')
        assert.deepEqual(r, {
            '|https://w/': {
                e: '3',
                q: '2',
                r: ''
            },
            '||q/': {
                w: '1'
            }
        })
    })

    test('invalid domain', function() {
        assert.throws( () => storage.ini_parse('[]\nw=1'), /Failed to tokenise/)
        assert.throws( () => storage.ini_parse('[q q]\nw=1'), /Invalid url/)
        assert.throws( () => storage.ini_parse('[ftp://q.com]\nw=1'), /Invalid protocol/)
    })

    test('invalid section', function() {
        assert.throws( () => { storage.ini_parse('[q]\n') },
                       /Empty section/)
        try {
            storage.ini_parse('\n[q]\n')
        } catch (e) {
            assert.equal(e.line_number, 2)
        }
    })

    test('invalid keypair', function() {
        assert.throws( () => { storage.ini_parse('[q]\nw w = 1') },
                     /Failed to tokenise/)
        assert.throws( () => { storage.ini_parse('[q]\n.w=1') },
                     /Unknown dot key/)
    })

    test('valid keypair', function() {
        let r = storage.ini_parse('[example.com:80]\nq=1\n.priority=2')
        assert.deepEqual(r, {
            "||example.com/": {
                ".priority": "2",
                "q": "1"
            }
        })
    })
})
