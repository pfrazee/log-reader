import yo from './yo-yo.js'

// globals
// 

// local user's log-dat:
var localDat = false

// setup
// =

// load from localstorage
try {
  localDat = JSON.parse(localStorage.localDat)
  localDat.name = '{you}'
  dat.serve(localDat.url) // make sure it's online
} catch (e) {
  if (localStorage.localDat) {
    console.error('Failed loading localDat', e)
  }  
}

// exported api
// =

export function get () {
  return localDat
}

export function renderPostCtrls () {
  return yo`<div id="post-ctrls" class="post-ctrls hidden">
    <textarea rows="15"></textarea>
    <div class="btns">
      <button onclick=${stopPost}>Cancel</button>
      <button onclick=${submitPost}>Post</button>
    </div>
  </div>`
}

export function renderSidenavCtrls () {
  var ctrlsEls = [yo`<button onclick=${startPost}>New Post</button>`]
  if (localDat && localDat.url) {
    ctrlsEls.push(' ')
    ctrlsEls.push(yo`<a href=${localDat.url} target="_blank">your log dat</a>`)
  }
  return yo`<div class="local-dat-ctrls">${ctrlsEls}</div>`
}

// internal methods
// =

// fetch or create the dat
function setupLocalDat () {
  if (localDat && localDat.url) {
    return Promise.resolve(localDat.url)
  }
  // create the dat
  return dat.createArchive({ 
    title: 'A dat blog',
    description: 'Created by the /log reader, v2'
  }).then(url => {
    // serve
    dat.serve(url)
    // save
    localDat = { url }
    localStorage.localDat = JSON.stringify(localDat)
    return url
  })
}

// ensure the log folder has been created
function setupLogFolder () {
  var folderUrl = (localDat.url + 'log')
  return dat.stat(folderUrl)
    // create if stat errored (assume it was a not-found)
    .catch(() => dat.createDirectory(folderUrl))
}

function startPost () {
  document.querySelector('#post-ctrls').classList.remove('hidden')
}

function stopPost () {
  document.querySelector('#post-ctrls textarea').value = ''
  document.querySelector('#post-ctrls').classList.add('hidden')
}

function submitPost () {
  // fetch data
  var txt = document.querySelector('#post-ctrls textarea').value
  if (!txt.trim()) return

  // ensure dat exists
  setupLocalDat()
    // ensure folder exists
    .then(setupLogFolder)
    // write to the folder
    .then(() => dat.writeFile(localDat.url + 'log/' + (Date.now()) + '.txt', txt, 'utf8'))
    // reload the page
    .then(() => { window.location.reload() })
    // error handling
    .catch(err => {
      // debugger;
      console.error(err)
    })
}