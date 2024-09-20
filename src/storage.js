import inireader from './inireader.js'

export function area() {
    return chrome.management.getSelf().then( v => {
        return chrome.storage[v.installType === 'development' ? 'local': 'sync']
    })
}

export class Storage {
    constructor(area) {
        this.area = area
    }

    get(key) {
        if (!key) throw new Error('key is required')
        return this.area.get(key).then( v => {
            return v[key] || `# Switch Google Search to a 'lightweight' mode.
# Other subdomains like www.google.com are also affected by this rule
#[google.com]
#user-agent = omglol/1.2.3

# add 'omg' header, set 'referer' & remove 'user-agent'
[127.0.0.1:80]
omg = lol
referer = http://example.com/
user-agent =
`
        })
    }

    set(key, str) {
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
    return parser.getBlock()
}
