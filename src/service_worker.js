import * as storage from './storage.js'

console.log('service worker')

let s = new storage.Storage(await storage.area())
console.log(await s.get('ini'))

window.s = s
