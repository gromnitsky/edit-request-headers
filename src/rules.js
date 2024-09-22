export function parse(user_settings) {
    return Object.keys(user_settings).map( (key, idx) => {
        return rule(key, user_settings[key], idx+1)
    })
}

function rule(key, val, id) {
    let r = {
        id,
        condition: { urlFilter : key },
        action: {
            type: 'modifyHeaders',
            requestHeaders: []
        }
    }

    for (let [k, v] of Object.entries(val)) {
        if ('.priority' === k) {
            let n = parseInt(v, 10)
            if (n > 1) r.priority = n
            continue
        }

        let h = {
            header: k,
            operation: v.length ? 'set' : 'remove'
        }
        if (v.length) h.value = v
        r.action.requestHeaders.push(h)
    }

    return r
}

export function update(my_rules) {
    return chrome.declarativeNetRequest.getDynamicRules().then( old => {
        return old.map( rule => rule.id)
    }).then( ids => {
        return chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ids,
            addRules: my_rules
        })
    })
}
