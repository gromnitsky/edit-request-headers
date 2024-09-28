import * as browser_storage from './storage.js'
import * as rules from './rules.js'
import * as plainDialogs from './node_modules/plain-dialogs/index.mjs'

async function main() {
    let s = new browser_storage.Storage(await browser_storage.area())
    new App(s)
}

class App {
    constructor(storage) {
        this.storage = storage

        this.node_save     = document.querySelector('#save')
        this.node_reset    = document.querySelector('#reset')
        this.node_textarea = document.querySelector('textarea')

        browser_storage.area_name().then( v => {
            document.querySelector('#storage_area_info').innerText = v
        })

        this.textarea_load()
        let input = debounce( () => this.node_save.disabled = false, 500)
        this.node_textarea.addEventListener('input', input)

        this.node_save.onclick = this.save.bind(this)
        this.node_reset.onclick = this.reset.bind(this)
    }

    textarea_load() {
        return this.storage.get('ini').then( str => {
            this.node_textarea.value = str
            this.node_save.disabled = true
        })
    }

    save() {
        let str = this.node_textarea.value
        this.storage.set('ini', str)
            .then( () => {    // reload rules
                let user_settings = browser_storage.ini_parse(str)
                let r = rules.parse(user_settings)
                return rules.update(r)
            }).then( () => {
                this.node_save.disabled = true
            }).catch( e => {
                let msg = e.message
                if (e.line_number) msg = `Line ${e.line_number}: ${msg}`
                return plainDialogs.alert(msg)
            })
    }

    reset() {
        plainDialogs.confirm('Are you sure? This cannot be undone.')
            .then( () => {
                return this.storage.clear()
            }).then( () => {
                return this.textarea_load()
            }).then( () => {
                this.save()
            })
    }
}

function debounce(fn, ms = 0) {
    let id
    return function(...args) {
        clearTimeout(id)
        id = setTimeout(() => fn.apply(this, args), ms)
    }
}

document.addEventListener('DOMContentLoaded', main)
