'use strict'

function split_if_found (txt, regex) {
  const m = txt.match(regex)
  return m == null ? [txt] : m.slice(1)
}

function render (txt, regex) {
  // highlight all matching substrings, then sanitize and make it into HTML paragraphs
  txt = txt.replace(/\x01/g, '\n\n').replace(/\x02/g, '\n')
  return (regex ? txt.replace(new RegExp(regex, 'igm'), '[[[$&]]]') : txt)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[\[\[/g, '<mark>')
    .replace(/\]\]\]/g, '</mark>')
    .replace(/^\n*/, '<p>')
    .replace(/\n*$/, '</p>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
}

function make_unit (titleText, className, txt, q, year) {
  const [txt0, u] = split_if_found(txt,  /^(.*)\x01\{([^\x01\x02]*)\}$/s)
  const [txt1, f] = split_if_found(txt0, /^(.*)\x01\[([^\x01\x02]*)\]$/s)
  // if matches the footnote or url, the matching unit is shown, but no text is highlighted
  const footnote = f ? '<p class="fn">[' + f + ']</p>' : ''
  const uu = u ? `&emsp;<a href="${u}">⦗🌐⦘</a>` : ''
  const y = year ? ' ('+year+')' : ''
  //
  const title = make_elem('div', { className: 'tl', innerHTML: titleText + y + uu })
  const unit  = make_elem('div', { className, innerHTML: render(txt1, q) + footnote })
  unit.prepend(title)
  return unit
}

function _mksrc (bk, b, i, q) {
  let tl = ''
  for (let j = i; j >= 0; --j) {
    if (tocs[b][j]) { tl = tocs[b][j]; break }
  }
  //
  const i_bgn = i === 0 || tocs[b][i] ? i : i-1
  const i_end = tocs[b][i+1] ? i : i+1
  const ix = i_bgn === i_end ? i_bgn : i_bgn + '-' + i_end
  return make_unit(
      meta[b][''].T + (tl.length ? ' :: ' + tl : '')
      + readsvg.replace(/^<a/, `<a href="#r=${b}:${ix}&to=${i}" `)
      + infosvg.replace(/^<a/, `<a href="#i=${b}" `)
      ,
    b+' src', bk[''], q, meta[b][''].Y ? toarab(meta[b][''].Y)+'م' : '')
}

function _mkdst (bk, b, i, t, q) {
  return make_unit(meta[b][t].T || meta[b][t].A || t,
    b+' dst '+t, bk[t], q, meta[b][t].Y)
}

function create_block (q, b, i, tids) {
  const a = make_elem('div', { id: 'u-'+b+'-'+i, className: 'ac' })
  const bk = books.access(b)[i]
  a.append(_mksrc(bk, b, i, q))
  for (let t of tids) {
    if (t === '') { continue }
    a.append(_mkdst(bk, b, i, t, q))
  }
  return a
}
