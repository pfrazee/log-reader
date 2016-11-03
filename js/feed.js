import yo from './yo-yo.js'
import * as sources from './sources.js'

var items = [{ content: 'Loading...' }]

// exported api
// =

export function renderList () {
  return items.map(renderItem)
}

export function loadListings () {
  var s = sources.getAll()
  return Promise.all(s.map(readLog)).then(listings => {
    // merge the listings into a single feed
    items = []
    listings.forEach((listing, i) => {
      var source = s[i]
      for (var filename in listing) {
        var item = listing[filename]
        // only include .txt files
        if (!filename.endsWith('.txt')) continue
        // attach some metadata
        item.filename = filename
        item.source = source
        item.content = false // to be loaded
        // add
        items.push(item)
      }
    })
    // now sort
    items.sort(feedSortFn)
  })
}

export function loadAndRenderFiles () {
  // iterate each entry, loading the file as needed and then rendering
  items.forEach((item, index) => {
    var url = join(item.source.url, item.name)
    dat.readFile(url, 'utf8')
      .then(content => {
        item.content = content
        yo.update(
          document.querySelector(`.feed .item[data-index="${index}"]`),
          renderItem(item, index)
        )
      }, error => {
        console.error('Failed to load file', url, error)
      })
  })
}

// internal methods
// =

function renderItem (item, index) {
  return yo`<div class="item" data-index=${index}>
    <div class="meta">
      ${sources.renderLink(item.source)} ${item.filename} ${(new Date(item.ctime || item.mtime)).toLocaleString()}
    </div>
    <div class="content">${item.content 
        ? makeHtmlSpan(linkify(makesafe(item.content)))
        : yo`<span class="muted">Loading...</span>`}</div>
  </div>`
}

function makesafe (str) {
  return str.replace(/</g, '&lt').replace(/>/g, '&gt;').replace(/&/g, '&amp;')
}

function linkify (str) {
  // replace any dat URLs with links
  return str.replace(/dat:\/\/([0-9a-z]{64})([\S]*)/gi, (match, hash, path) => {
    match = match.replace(/"/g, '')
    return `<a href="${match}">dat://${hash.slice(0,6)}..${hash.slice(-2)}${path}</a>`
  }) 
}

function makeHtmlSpan (html) {
  var span = yo`<span></span>`
  span.innerHTML = html
  return span
}

function readLog (source) {
  source = sources.get(source)
  if (!source) return Promise.reject('Invalid source')
  return dat.readDirectory(join(source.url, 'log'))
}

function feedSortFn (a, b) {
  a = a.ctime || a.mtime // fallback to mtime
  b = b.ctime || b.mtime // fallback to mtime
  return b - a
}

// simple path joiner
function join (a, b) {
  var aSlash = a.endsWith('/')
  var bSlash = b.startsWith('/')
  if (aSlash && bSlash) return a + b.slice(1)
  if (!aSlash && !bSlash) return a + '/' + b
  return a + b
}