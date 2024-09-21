export default function rules(user_settings) {
    return Object.keys(user_settings).map( (key, idx) => {
        return rule(key, user_settings[key], idx)
    })
}

function rule(key, val, id) {
    let r = {
        id,
        condition: {
            urlFilter : key,
            resourceTypes : ["main_frame", "sub_frame"]
        },
        action: {
            type: 'modifyHeaders',
            requestHeaders: []
        }
    }

    for (let [k, v] of Object.entries(val)) {
        if ('.priority' === k) {
            let n = parseInt(k)
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
