import * as storage from './storage.js'
import * as rules from './rules.js'

async function main() {
    let s = new storage.Storage(await storage.area())
    let user_settings = storage.ini_parse(await s.get('ini'))
    let r = rules.parse(user_settings)
    rules.update(r)
}

function is_firefox() { return navigator.userAgent.indexOf('Firefox') !== -1 }

let rule_debug = chrome.declarativeNetRequest.onRuleMatchedDebug
if ( !is_firefox() && rule_debug) {
    rule_debug.addListener(console.log)
}

main()
console.log('service worker')
