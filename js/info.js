const info = (function () {

  const push_dt_dd = (dl, dt, dd, ltr) => {
    const s = document.createElement('span')
    const t = mk_el('dt', dt)
    const d = mk_el('dd', dd)
    if (ltr) { d.style.direction = 'ltr' }
    s.append(t, d)
    dl.append(s)
  }

  const ln = {
    en: 'الإنجليزية',
  }

  function show_info (bid, tid) {
    const bk = meta[bid][tid]
    //
    el_r.append(mk_el(tid === '' ? 'h1' : 'h2', tid === '' ? bk.T : bk.T || bk.A || tid))
    //
    const dl = document.createElement('dl')
    if (bk.A && bk.T) { push_dt_dd(dl, 'المؤلف: ',  bk.A) }
    if (tid !== '') { push_dt_dd(dl, 'اللغة: ',   ln[bk.L || 'en']) }
    if (bk.Y) { push_dt_dd(dl, 'السنة: ',   bk.Y) }
    if (bk.S) { push_dt_dd(dl, 'المصدر: ',  bk.S, 1) }
    if (bk.D) { push_dt_dd(dl, 'الوصف: ',   bk.D, tid !== '') }
    el_r.append(dl)
  }

  const make_toc_elem = (text, href, length) => {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.innerHTML = text + (length == null ? '' : ' <span>(' + toarab(length) + ')</span>')
    a.href = href
    li.append(a)
    return li
  }

  function show_book_info (bid) {
    el_r.innerHTML = ''

    // info
    for (let t of trid(bid)) { show_info(bid, t) }

    // toc
    const idxs = Object.keys(tocs[bid]).sort((a,b) => a - b)
    const n = idxs.length
    idxs[n] = meta[bid][''].N
    //
    const ul = document.createElement('ul')
    ul.className = 'toc'
    ul.append(...range(n).map(j => make_toc_elem(tocs[bid][idxs[j]], `#r=${bid}:${idxs[j]}`, idxs[j+1] - idxs[j])))
    el_r.append(mk_el('h2', 'جدول المحتويات'), ul)
  }

  function show_books_all (wrong) {
    el_r.innerHTML = ''
    const head = document.createElement('center')
    head.innerHTML = (wrong ? 'تعذر إيجاد هذا الكتاب. ' : '')
                   + 'الكتب&nbsp;المتاحة&nbsp;هي:'
    const ul = document.createElement('ul')
    ul.className = 'toc'
    ul.append(...bids.map(bid => make_toc_elem(meta[bid][''].T, `#i=${bid}`)))
    el_r.append(head, ul)
  }

  // if provided nothing, just show allbooks
  // if provided wrong id, show allbooks with an error msg
  // otherwise show the book info
  return (bid) => bid === '' ? show_books_all() : bids.indexOf(bid) === -1 ? show_books_all(1) : show_book_info(bid)

}())
