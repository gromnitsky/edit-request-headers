import * as browser_storage from './storage.js'
import * as rules from './rules.js'
import * as plainDialogs from './node_modules/plain-dialogs/index.mjs'
import * as editor from './editor.js'

async function main() {
    let s = new browser_storage.Storage(await browser_storage.area())
    new App(s)
}

class App {
    constructor(storage) {
        this.storage = storage

        this.node_save   = document.querySelector('#save')
        this.node_reset  = document.querySelector('#reset')
        this.node_debug  = document.querySelector('#storage_area_info')

        let input = debounce( () => this.node_save.disabled = false, 500)

        this.editor_view = new editor.EditorView({
            extensions: [editor.basicSetup,
                         editor.EditorView.updateListener.of( v => {
                            if (v.docChanged) input()
                         })],
            parent: document.querySelector('#editor')
        })
        this.editor_load()

        browser_storage.area_name().then( v => {
            document.querySelector('#storage_area_info').innerText = v
        })

        this.node_save.onclick = this.save.bind(this)
        this.node_reset.onclick = this.reset.bind(this)
        this.node_debug.onclick = this.ini_parse_debug.bind(this)
    }

    ini_parse_debug() {
        console.log(browser_storage.ini_parse(this.editor_text()))
    }

    editor_text() {
        return this.editor_view.state.doc.toString()
    }

    editor_load() {
        return this.storage.get('ini').then( str => {
            this.editor_view.dispatch({ // delete
                changes: {
                    from: 0, to: this.editor_view.state.doc.length,
                    insert: ''
                }
            })
            this.editor_view.dispatch({
                changes: {from: 0, insert: str}
            })
            this.node_save.disabled = true
        })
    }

    save() {
        let str = this.editor_text()
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
        plainDialogs.confirm('Are you sure?')
            .then( () => {
                return this.storage.clear()
            }).then( () => {
                return this.editor_load()
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
