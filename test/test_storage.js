let storage = await import(`../${process.env.out}/ext/storage.js`)
import assert from 'assert'

suite('ini', function() {
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
        assert.throws( () => { storage.ini_parse('[]\nw=1') })
        assert.throws( () => { storage.ini_parse('[q q]\nw=1') })
    })

    test('invalid section', function() {
        assert.throws( () => { storage.ini_parse('[q]\n') },
                     /empty section for q$/)
    })

    test('invalid keypair', function() {
        assert.throws( () => { storage.ini_parse('[q]\nw w = 1') },
                     /invalid header name/)
        assert.throws( () => { storage.ini_parse('[q]\n.w=1') },
                     /unknown dot key/)
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
