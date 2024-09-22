import * as storage from './storage.js'
import * as rules from './rules.js'

let s = new storage.Storage(await storage.area())
let user_settings = storage.ini_parse(await s.get('ini'))
let r = rules.parse(user_settings)
rules.update(r)

// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(evt => {
//   console.log(evt)
// })

console.log('service worker')
