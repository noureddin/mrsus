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

  function show_all (bid) {
    el_r.innerHTML = ''

    // info
    for (let t of trid(bid)) { show_info(bid, t) }

    // toc
    el_r.append(mk_el('h2', 'جدول المحتويات'), make_toc(
      Object.keys(tocs[bid]).sort((a,b) => a - b)
        .map(idx => make_toc_elem(tocs[bid][idx], `#r=${bid}:${idx}`))
    ))
  }

  return show_all

}())
