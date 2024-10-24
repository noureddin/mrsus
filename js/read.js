'use strict'

const read = (function () {

  let b
  let tids, is_tids_all
  let i_bgn
  let i_end
  let last  // last index in the current book
  let wantlast

  function update_hash () {
    const tt = is_tids_all ? '' : '/' + tids.join(',')
    const iB = wantlast && i_bgn === last ? '$' : i_bgn
    const iE = wantlast && i_end === last ? '$' : i_end
    const ii = iB === iE ? iB : iB + '-' + iE
    set_hash('r=' + b + tt + ':' + ii)
  }

  function prepend () {
    if (!books.load(b)) { setTimeout(prepend, 100); return }
    el_r.removeChild(spinner)
    if (tocs[b][i_bgn+1]) { el_r.prepend(make_elem('hr')) }
    el_r.prepend(create_block(null, b, i_bgn, tids))
    if (i_bgn > 0) { el_r.prepend(prevbtn) }
    update_hash()
  }

  function append () {
    if (!books.load(b)) { setTimeout(append, 100); return }
    el_r.removeChild(spinner)
    if (tocs[b][i_end]) { el_r.append(make_elem('hr')) }
    el_r.append(create_block(null, b, i_end, tids))
    if (i_end < last) { el_r.append(nextbtn) }
    update_hash()
  }

  function really_read (goto_idx) {
    if (!books.load(b)) { setTimeout(really_read, 100, goto_idx); return }
    el_r.innerHTML = ''
    //
    if (i_bgn > 0) { el_r.append(prevbtn) }
    el_r.append(create_block(null, b, i_bgn, tids))
    for (let i = i_bgn+1; i <= i_end; ++i) {
      if (tocs[b][i]) { el_r.append(make_elem('hr')) }
      el_r.append(create_block(null, b, i, tids))
    }
    if (i_end < last) { el_r.append(nextbtn) }
    //
    if (goto_idx != null && goto_idx >= i_bgn && goto_idx <= i_end) {
      Qid('u-'+b+'-'+goto_idx).scrollIntoView()
    }
  }

  function init (param, goto_idx) {
    const [btr, ix] = param.split(/:/)
    el_r.innerHTML = ''
    el_r.append(spinner)
    //
    // if error in parsing the book id or translation id, or no range
    //   show book info (if bid is correct) or show all books
    try {
      if (btr.indexOf('/') === -1) {
        b = btr
        if (bids.indexOf(b) === -1) { throw '' }
        tids = trid(b).slice(1)
        is_tids_all = true
      }
      else {
        const x = btr.split('/')
        b = x[0]
        if (bids.indexOf(b) === -1) { throw '' }
        tids = x[1].split(',')
        // validate tids
        const xtids = new Set(trid(b))
        for (let t of tids) {
          if (!xtids.has(t)) { throw '' }
        }
        if (tids.length === xtids.size) { is_tids_all = true }
      }
      if (ix == null) { throw '' }  // no range (no `:`)
    }
    catch {
      // L.hash = 'i=' + b  // switch to the info view, and sync the url
      info(b)  // switch to the info view, but keep the url
      return
    }
    //
    last = meta[b][''].N - 1
    //
    if (ix.indexOf('-') === -1) {
      wantlast = ix === '$'
      i_bgn = i_end = wantlast ? last : +ix
    }
    else {
      const s = ix.split('-')
      wantlast = s[1] === '$' || s[0] === '$'
      i_bgn = s[0] === '$' ? last : +s[0]
      i_end = s[1] === '$' ? last : +s[1]
    }
    if ( isNaN(i_bgn) && !isNaN(i_end)) { i_bgn = i_end }
    if (!isNaN(i_bgn) &&  isNaN(i_end)) { i_end = i_bgn }
    if ( isNaN(i_bgn) &&  isNaN(i_end)) { i_bgn = i_end = 0 }
    //
    if (i_bgn > last) { i_bgn = last }
    if (i_end > last) { i_end = last }
    //
    prevbtn.onclick = () => {
      --i_bgn
      el_r.removeChild(prevbtn)
      el_r.prepend(spinner)
      setTimeout(prepend, 0)  // not requestAnimationFrame
    }
    nextbtn.onclick = () => {
      ++i_end
      el_r.removeChild(nextbtn)
      el_r.append(spinner)
      setTimeout(append, 0)  // not requestAnimationFrame
    }
    //
    // console.log(b, tids, i_bgn, i_end)
    update_hash()
    really_read(goto_idx)
    // return [b, i_bgn, i_end]
  }

  return init

}())
