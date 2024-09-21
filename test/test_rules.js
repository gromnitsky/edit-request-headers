let storage = await import(`../${process.env.out}/ext/storage.js`)
let rules = (await import(`../${process.env.out}/ext/rules.js`)).default
import assert from 'assert'

let area = {
    get: () => Promise.resolve({})
}

suite('rules', function() {
    setup(function() {
    })

    test('smoke', async function() {
        let s = new storage.Storage(area)
        let user_settings = storage.ini_parse(await s.get('ini'))
        let r = rules(user_settings)
        assert.deepEqual(r, [
            {
                "id" : 0,
                "action" : {
                    "type": "modifyHeaders",
                    "requestHeaders": [
                        {
                            "header": "omg",
                            "operation": "set",
                            "value": "lol"
                        },
                        {
                            "header": "referer",
                            "operation": "set",
                            "value": "http://example.com/"
                        },
                        {
                            "header": "user-agent",
                            "operation": "remove"
                        },
                    ]
                },
                "condition" : {
                    "urlFilter" : "||127.0.0.1/",
                    "resourceTypes" : ["main_frame", "sub_frame"]
                }
            }
        ])
    })

    test('priority key ignored', function() {
        let r = rules({
            '||127.0.0.1/': {
                '.priority': '1',
                'omg': 'lol'
            }
        })
        assert.deepEqual(r, [
            {
                "id" : 0,
                "action" : {
                    "type": "modifyHeaders",
                    "requestHeaders": [
                        {
                            "header": "omg",
                            "operation": "set",
                            "value": "lol"
                        },
                    ]
                },
                "condition" : {
                    "urlFilter" : "||127.0.0.1/",
                    "resourceTypes" : ["main_frame", "sub_frame"]
                }
            }
        ])
    })

    test('priority key included', function() {
        let r = rules({
            '||127.0.0.1/': {
                '.priority': '2',
                'omg': 'lol'
            }
        })
        assert.deepEqual(r, [
            {
                "id" : 0,
                "priority": 2,
                "action" : {
                    "type": "modifyHeaders",
                    "requestHeaders": [
                        {
                            "header": "omg",
                            "operation": "set",
                            "value": "lol"
                        },
                    ]
                },
                "condition" : {
                    "urlFilter" : "||127.0.0.1/",
                    "resourceTypes" : ["main_frame", "sub_frame"]
                }
            }
        ])
    })

})
