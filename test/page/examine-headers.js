window.addEventListener('DOMContentLoaded', main)

function main() {
    let b = document.querySelector('button')
    b.onclick = button
    b.click()
}

function button(evt) {
    evt.target.disabled = true
    render('')
    headers().then(render).catch(render)
        .finally( () => evt.target.disabled = false)
}

async function headers() {
    return efetch(`request-headers.php?t=${Date.now()}`).then(v => v.json())
}

function render(json) {
    let out = document.querySelector('#headers')
    if (json instanceof Error || !json) { out.innerText = json; return }

    let rows = Object.entries(json)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map( v => `<tr><td>${e(v[0])}</td><td>${e(v[1])}</td></tr>`)
    out.innerHTML = ['<table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody>', ...rows, '</tbody></table>'].join`\n`
}

function efetch(url, opt) {
    let fetcherr = r => {
        if (!r.ok) throw new Error(r.statusText)
        return r
    }
    return fetch(url, opt).then(fetcherr)
}

function e(s) {
    return s ? s.toString().replace(/[<>&'"]/g, ch => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '\'': '&apos;',
        '"': '&quot;'
    }[ch])) : ''
}
