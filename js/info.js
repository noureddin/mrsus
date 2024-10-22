const info = (function () {

  const push_dt_dd = (dl, dt, dd, ltr) => {
    const s = document.createElement('span')
    const t = make_elem('dt', { innerHTML: dt })
    const d = make_elem('dd', { innerHTML: dd })
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
    el_r.append(make_elem(tid === '' ? 'h1' : 'h2', { innerHTML: tid === '' ? bk.T : bk.T || bk.A || tid }))
    //
    const dl = document.createElement('dl')
    if (bk.A && bk.T) { push_dt_dd(dl, 'المؤلف: ',  bk.A) }
    if (tid !== '') { push_dt_dd(dl, 'اللغة: ',   ln[bk.L || 'en']) }
    if (bk.Y) { push_dt_dd(dl, 'السنة <small>(م)</small>: ',   bk.Y) }
    if (bk.S) { push_dt_dd(dl, 'المصدر: ',  bk.S, 1) }
    if (bk.D) { push_dt_dd(dl, 'الوصف: ',   bk.D, tid !== '') }
    el_r.append(dl)
  }

  const make_toc_elem = (text, href, len) => {
    const innerHTML = text + (len == null ? '' : ' <span>(' + toarab(len) + ')</span>')
    return make_elem('li', {}, [ make_elem('a', { href, innerHTML }) ])
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
    const toc = range(n).map(j =>
      make_toc_elem(tocs[bid][idxs[j]], `#r=${bid}:${idxs[j]}`, idxs[j+1] - idxs[j]))
    //
    if (n === 0) {  // no headers at all (only the length)
      toc.unshift(make_toc_elem('الكتاب كاملا', `#r=${bid}:0`, idxs[0]))
    }
    else if (idxs[0] != 0) {  // the first header is not the very first unit
      toc.unshift(make_toc_elem('المقدمة', `#r=${bid}:0`, idxs[0]))
    }
    //
    el_r.append(
      make_elem('h2', { innerHTML: 'جدول المحتويات' }),
      make_elem('ul', { className: 'toc' }, toc))
  }

  function show_books_all (wrong) {
    el_r.innerHTML = ''
    el_r.append(
      // head
      make_elem('center', {
        innerHTML: (wrong ? 'تعذر إيجاد هذا الكتاب. ' : '')
                   + 'الكتب&nbsp;المتاحة&nbsp;هي:' }),
      // books list
      make_elem('ul', { className: 'toc' },
        bids.map(bid => make_toc_elem(meta[bid][''].T, `#i=${bid}`)))
      )
    }

  // if provided nothing, just show all books
  // if provided wrong id, show all books with an error msg
  // otherwise show the book info
  return (bid) =>
      bid === '' ? show_books_all()
    : bids.indexOf(bid) === -1 ? show_books_all(1)
    : show_book_info(bid)

}())
