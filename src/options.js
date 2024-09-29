import * as browser_storage from './storage.js'
import * as rules from './rules.js'
import * as plainDialogs from './node_modules/plain-dialogs/index.mjs'
import * as editor from './vendor/editor.js'
import debounce from './vendor/debounce.js'

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

        this.editor_view = new editor.EditorView({
            extensions: [editor.my_setup,
                         editor.lintGutter(),
                         this.my_update_listener(),
                         this.my_linter()],
            parent: document.querySelector('#editor')
        })
        this.load(true)

        browser_storage.area_name().then( v => {
            document.querySelector('#storage_area_info').innerText = v
        })

        this.node_save.onclick = this.save.bind(this)
        this.node_reset.onclick = this.reset.bind(this)
        this.node_debug.onclick = this.ini_parse_debug.bind(this)
    }

    my_update_listener() {
        let cb = debounce( v => {
            if (v.docChanged) this.node_save.disabled = false
        }, 500, {leading: true, trailing: false})
        return editor.EditorView.updateListener.of(cb)
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

    load(first_time) {
        return this.storage.get('ini').then( str => {
            this.editor_view.dispatch({ // delete
                changes: { from: 0, to: this.doc().length, insert: '' },
                annotations: editor.Transaction.addToHistory.of(!first_time)
            })
            this.editor_view.dispatch({
                changes: {from: 0, insert: str},
                annotations: editor.Transaction.addToHistory.of(!first_time)
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

document.addEventListener('DOMContentLoaded', main)
