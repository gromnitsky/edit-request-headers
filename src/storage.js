import inireader from './vendor/inireader.js'

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
    let parser = new inireader.IniReader()
    parser.load = function(s) { // a monkey patch for v2.2.1
        this.lines = s.split("\n").filter(Boolean)
        this.values = this.parseFile()
        this.emit('fileParse')
    }
    parser.load(str || '')
    let r = {}
    for (let [url_condition, v] of Object.entries(parser.getBlock())) {
        r[domain(url_condition)] = keypairs(url_condition, v)
    }
    return r
}

function domain(str = '') {
    let protocol = ''
    if (!/^[a-z]+:/i.test(str)) {
        protocol = 'http://'
        str = [protocol, str].join`/`
    }
    let url
    try {
        url = new URL(str)
    } catch (_) {
        throw new Error(`invalid url: ${str.slice(0, 50)}`)
    }
    let pathname = `${url.pathname}/`.replace(/\/+/g, '/')
    return [protocol ? '||' : '|', protocol ? '' : `${url.protocol}//`,
            url.host, pathname].join``
}

function keypairs(url_condition, obj) {
    if (!Object.keys(obj).length)
        throw new Error(`empty section for ${url_condition.slice(0, 20)}`)
    let r = {}
    for (let [k, v] of Object.entries(obj)) {
        if ( !/^\.?[a-z_-]+$/i.test(k))
            throw new Error(`invalid header name: ${k.slice(0, 20)}`)
        if ('.' === k[0] && '.priority' !== k) {
            throw new Error(`unknown dot key: ${k.slice(0,20)}`)
        }
        r[k.toLowerCase()] = v
    }
    return r
}
