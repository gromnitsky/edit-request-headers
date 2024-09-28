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

        this.save_disable = debounce( (hint) => {
            this.node_save.disabled = hint
        }, 500)

        this.editor_view = new editor.EditorView({
            extensions: [editor.basicSetup,
                         editor.lintGutter(),
                         this.editor_update_listener(),
                         this.my_linter()],
            parent: document.querySelector('#editor')
        })
        this.load()

        browser_storage.area_name().then( v => {
            document.querySelector('#storage_area_info').innerText = v
        })

        this.node_save.onclick = this.save.bind(this)
        this.node_reset.onclick = this.reset.bind(this)
        this.node_debug.onclick = this.ini_parse_debug.bind(this)
    }

    editor_update_listener() {
        return editor.EditorView.updateListener.of( v => {
            if (v.docChanged) {
                let hint = v.transactions[0].annotations.find( v => v.value === "load")
                this.save_disable(hint)
            }
        })
    }

    my_linter() {
        return editor.linter( () => {
            let diagnostics = []
            try {
                browser_storage.ini_parse(this.doc().toString())
            } catch (e) {
                if (!e.line_number) return diagnostics

                let pos = this.doc().line(e.line_number)
                diagnostics.push({
                    from: pos.from,
                    to: pos.to,
                    severity: "error",
                    message: e.message,
                })
            }
            return diagnostics
        })
    }

    doc() { return this.editor_view.state.doc; }

    ini_parse_debug() {
        console.log(browser_storage.ini_parse(this.doc().toString()))
    }

    load() {
        return this.storage.get('ini').then( str => {
            this.editor_view.dispatch({ // delete
                changes: {
                    from: 0, to: this.doc().length,
                    insert: ''
                }
            })
            this.editor_view.dispatch({
                changes: {from: 0, insert: str},
                annotations: {value: 'load'}
            })
        })
    }

    save() {
        let str = this.doc().toString()
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
                return this.load()
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
