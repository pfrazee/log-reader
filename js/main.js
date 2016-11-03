import yo from './yo-yo.js'
import * as feed from './feed.js'
import * as sources from './sources.js'
import * as localDat from './local-dat.js'

// globals
// =

var globalError

// setup
// =

render()
feed.loadListings().then(() => {
  // render now, so the user sees some progress
  render()
  // load the files, showing each entry as they're available'
  feed.loadAndRenderFiles()
}, onerror)

// internal api
// =

function render () {
  var layoutEl = document.querySelector('.layout')
  yo.update(layoutEl, yo`<div class="layout">
    <div class="feed">
      ${ localDat.renderPostCtrls() }
      ${ feed.renderList() }
    </div>
    <div class="sidebar">
      ${ localDat.renderSidenavCtrls() }
      ${ sources.renderList() }
    </div>
  </div>`)
}

function onerror (e) {
  globalError = e
  console.error(e)
}