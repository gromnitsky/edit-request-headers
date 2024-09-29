export {EditorView} from 'codemirror'
export {Transaction} from '@codemirror/state'
export {linter, lintGutter} from '@codemirror/lint'

import { lineNumbers, highlightActiveLineGutter, drawSelection, keymap } from '@codemirror/view'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'

let my_setup = [
    lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    drawSelection(),
    highlightSelectionMatches(),
    keymap.of([
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...lintKeymap
    ])
]

export { my_setup }
