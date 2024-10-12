'use strict'

const read = (function () {

  let b
  let tids, is_tids_all
  let i_bgn
  let i_end
  let last

  function update_hash () {
    const tt = is_tids_all ? '' : '/' + tids.join(',')
    set_hash('r=' + b + tt + ':' + i_bgn + '-' + i_end)
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
    last = books.access(b).length - 1
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
    if (btr.indexOf('/') === -1) {
      b = btr
      tids = trid(b).slice(1)
      is_tids_all = true
    }
    else {
      const x = btr.split('/')
      b = x[0]
      tids = x[1].split(',')
    }
    //
    if (ix.indexOf('-') === -1) {
      i_bgn = i_end = +ix
    }
    else {
      const s = ix.split('-')
      i_bgn = +s[0]
      i_end = +s[1]
    }
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
    really_read(goto_idx)
    // return [b, i_bgn, i_end]
  }

  return init

}())
