#!/usr/bin/env node

import { build } from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

build({
    plugins: [NodeModulesPolyfillPlugin()],
    entryPoints: [process.argv[2] || usage()],
    bundle: true,
    format: 'esm'
})

function usage() { console.warn('Usage: esbuild.js file.js'), process.exit(1) }
