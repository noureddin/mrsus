'use strict'

// All the JS files are definitions only. There is no single statement
// with a side effect. Our "main" function, that actually starts the
// app, is called refresh(). This function is called on loading the
// page, and when the user clicks an internal link, and also when the
// user changes the URL parameters directly.
//
// The last two cases are covered by a single event: onhashchange.
// The problem is that this event also covers another, unintended,
// case: when we change the URL parameters to reflect the current state
// of the app. We do that so that the user can copy the URL at any
// moment and whoever opens that URL sees the same exact page. It also
// helps avoiding the problem of infinite-scrolling apps: losing what
// you're looking at if you, for example, pressed F5 or Ctrl+R by
// accident. We update the URL so that you can never lose anything other
// than your scroll position, but the entire content of the current page
// is identified by the URL parameters.
//
// So, we need to call our main function ("refresh") on every hash
// change, but not when we change it programmatically.
//
// We do so by assigning true to no_onhashchange, and return immediately
// from our main function if it's true, after setting it to false.
//
// The primary reason we set it to false in refresh() is that it's
// called asynchronously (by nature, as it's an event handler). So it's
// really difficult to unset it in the caller at the right moment.
// It's way more reliable just to unset it in refresh().
// It's also less error-prone that way.

// function parse_goto (goto) {
//   // can be bid:idx for search or read; and can be idx for read
//   if (goto.match(/^[0-9]+$/)) { return ['', +goto] }
//   const gt = goto.split(/:/)
//   if (gt.length != 2) { return ['', -1] }
//   if (gt[1].match(/^[0-9]+$/)) { return [gt[0], +gt[1]] }
//   return ['', -1]
// }

// function perform_goto (goto, b) {
//   // provide a book id (b) to force the goto param to not have another id (read mode)
//   // ignore it to require having a book id (search mode)
//   const [gb, gi] = parse_goto(goto)
//   const cond_gb = b ? (gb === '' || gb === b) : (gb !== '')
//   const bid = b || gb
//   if (cond_gb && gi !== -1) {
//     console.log('goto', bid, gi)
//     const u = Qid('u-'+bid+'-'+gi)
//     if (u) { setTimeout(() => u.scrollIntoView(), 0) }
//   }
// }

function refresh () {
  // don't use search params "/?q="; only use hash params "/#q="; it'll still reload the content
  const params = (L.search + L.hash).slice(1).split(/[?#&]/)

  let state
  let what
  let books
  let goto
  for (let u = 0; u < params.length; ++u) {
    if      (params[u].startsWith('r=')) { what  = params[u].slice(2); state = 'r' }
    else if (params[u].startsWith('q=')) { what  = params[u].slice(2); state = 'q' }
    else if (params[u].startsWith('i=')) { what  = params[u].slice(2); state = 'i' }
    else if (params[u].startsWith('b=')) { books = params[u].slice(2) }
    else if (params[u].startsWith('to=')){ goto  = params[u].slice(3) }
  }

  if (books) {
    Qall('#f input:checked').forEach(el => { el.checked = false })
    for (let b of books.split(',')) { Qid('f_'+b).checked = true }
  }

  el_r.innerHTML = ''

  if (state === 'q') {
    search(what)
    // perform_goto(goto)
  }
  else if (state === 'r') {
    filter_select_only(what)  // make bookfilter only has this book checked, if it's a valid book
    el_q.value = ''  // otherwise search would "take over" the reading mode
    search(false)    // enable search, without loading any books
    read(what, goto && goto.match(/^[0-9]+$/) ? +goto : null)
    // perform_goto(goto, b)
  }
  else if (state === 'i') {
    filter_select_only(what)  // make bookfilter only has this book checked, if it's a valid book
    el_q.value = ''  // otherwise search would "take over" the info mode
    search(false)    // enable search, without loading any books
    info(what)
  }
  else {
    search()
    el_r.innerHTML = '<center><br><br>اكتب عبارة بالإنجليزية ثم اضغط «ابحث» للبحث عنها في&nbsp;ترجمات&nbsp;الكتب&nbsp;العربية</center>'
  }

}

function filter_select_only (bid) {
  // select only the current book to search in
  const w = Qid('f_'+bid)
  if (w) {  // only change filters if the book is a valid one
    Qall('#f input:checked').forEach(el => { el.checked = false })
    w.checked = true
  }
}

function set_hash (newhash) {
  onhashchange = null
  L.hash = newhash
  setTimeout(() => onhashchange = refresh, 0)
}

// our main code
onload = refresh
onhashchange = refresh
el_dark.oninput = change_dark
init_dark()
Qall('#f label').forEach(el => {
  const b = el.querySelector('input').id.slice(2)  // remove f_
  el.insertAdjacentHTML('afterend', infosvg.replace(/^<a/, `<a href="#i=${b}" `))
})

