import * as storage from './storage.js'
import * as rules from './rules.js'

async function main() {
    let s = new storage.Storage(await storage.area())
    let user_settings = storage.ini_parse(await s.get('ini'))
    let r = rules.parse(user_settings)
    rules.update(r)
}

function is_firefox() { return navigator.userAgent.indexOf('Firefox') !== -1 }

if (!is_firefox()) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(evt => {
        console.log(evt)
    })
}

main()
console.log('service worker')
