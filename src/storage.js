import * as ini from './ini.js'

export async function area_name() {
    let v = await chrome.management.getSelf()
    return v.installType === 'development' ? 'local': 'sync'
}

export async function area() { return chrome.storage[await area_name()] }

export class Storage {
    constructor(area) {
        this.area = area
    }

    get(key) {
        if (!key) throw new Error('key is required')
        return this.area.get(key).then( v => {
            return v[key] || `# Switch Google Search to a 'lightweight' mode.
# Its subdomains like www.google.com are also affected by this rule.
#[google.com]
#user-agent = omglol/1.2.3

# Add 'omg' header, change 'referer', & remove 'user-agent'.
[127.0.0.1:80]
omg = lol
referer = http://example.com/
user-agent =
`
        })
    }

    async set(key, str) {
        if (!key) throw new Error('key is required')
        ini_parse(str)          // validate
        return this.area.set({[key]: str})
    }

    clear() {
        return this.area.clear()
    }
}

export function ini_parse(str) {
    let conf = ini.parse(str)
    let r = {}
    for (let [url_condition, v] of Object.entries(conf)) {
        r[domain(url_condition, v[ini.LINE])] = keypairs(url_condition, v)
    }
    return r
}

function err(msg, line_number) {
    let r = new Error(msg)
    r.line_number = line_number
    return r
}

function domain(str = '', line_number) {
    let protocol = ''
    let m
    if ( (m = str.match(/^([a-zA-Z0-9]+):/i))) {
        if (m[1] !== 'http' && m[1] !== 'https')
            throw err('Invalid protocol', line_number)
    } else {
        protocol = 'http://'
        str = [protocol, str].join``
    }
    let url
    try {
        url = new URL(str)
    } catch (_) {
        throw err('Invalid url', line_number)
    }
    let pathname = `${url.pathname}/`.replace(/\/+/g, '/')
    return [protocol ? '||' : '|', protocol ? '' : `${url.protocol}//`,
            url.host, pathname].join``
}

function keypairs(url_condition, obj) {
    if (!Object.keys(obj).length) {
        throw err('empty section', obj[ini.LINE])
    }
    let r = {}
    for (let [k, v] of Object.entries(obj)) {
        let line_number = v[ini.LINE]
        if ( !/^\.?[a-z_-]+$/i.test(k))
            throw err('invalid header name', line_number)
        if ('.' === k[0] && '.priority' !== k) {
            throw err('unknown dot key', line_number)
        }
        r[k.toLowerCase()] = v.value
    }
    return r
}
