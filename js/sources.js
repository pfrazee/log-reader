import yo from './yo-yo.js'
import * as localDat from './local-dat.js'

// globals
// =

const DAT_URL_REGEX = /^(dat:\/\/[0-9a-z]{64})/i

// current form error
var formError = false

// default sources:
var sources = [
  { name: '/log', url: window.location.origin },
  { name: 'pfrazee', url: 'dat://6d4e2f3d2b0b70f040efbe92b63368db9f0464ade9959dd46d0813f72fe3f881' }
]

// setup
// =

// load from localstorage
try {
  sources = JSON.parse(localStorage.sources)
} catch (e) {
  if (localStorage.sources) {
    console.error('Failed loading sources', e)
  }
}

// exported api
// =

export function getAll () {
  if (localDat.get()) return [localDat.get()].concat(sources)
  return sources
}

export function get (source) {
  if (typeof source === 'object') return source
  if (source === localDat.get().url) return localDat.get()
  return sources.find(s => s.name === source)
}

export function getLocalFeed () {
  return localFeed
}

export function renderList () {
  return yo`<div class="sources">
    <h4>sources</h4>
    ${ sources.map(renderSource) }
    <form onsubmit=${onSubmit}>
      <div><input type="text" name="url" placeholder="URL" /></div>
      <div><input type="text" name="name" placeholder="Name" /></div>
      <div><button>Add</button></div>
      ${ formError ? yo`<div class="error">${formError}</div>` : ''}
    </form>
  </div>`
}

function renderSource (source, index) {
  return yo`<div>
    [<a href="#" onclick=${onClickDelete(index)}>x</a>]
    <a href="${source.url}">${source.name}</a>
  </div>`
}

export function renderLink (source) {
  source = get(source)
  if (!source) return ''
  return yo`<strong><a href=${source.url}>${source.name}</a></strong>`
}

// internal api
// =

function onSubmit (e) {
  e.preventDefault()
  e.stopPropagation()

  // fetch and validate
  var url = e.target.url.value
  var name = e.target.name.value
  if (!url) return renderFormError('URL is required')
  if (!name) return renderFormError('Name is required')
  var urlMatch = DAT_URL_REGEX.exec(url)
  if (!urlMatch) return renderFormError('URL must be a dat:// url')

  // add new source
  sources.push({ url: urlMatch[0], name })
  saveSourcesToLocalStorage()
  window.location.reload()
}

function onClickDelete (index) {
  return e => {
    sources.splice(index, 1)
    saveSourcesToLocalStorage()
    window.location.reload()
  }
}

function renderFormError (err) {
  formError = err
  yo.update(
    document.querySelector('.sources'),
    renderList()
  )
}

function saveSourcesToLocalStorage () {
  localStorage.sources = JSON.stringify(sources)
}