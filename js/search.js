'use strict'

const search = (function () {

  // selected books in the UI -- slice() to remove 'f_' from id
  const bkk = () => Array.from(Qall('#f input:checked')).map(el => el.id.slice(2))

  const load_all = () => books.load_many(bkk())

  const PUNT = '(?:[-\\s!?\|\'"(),./:;\\[\\]`{}\u201C\u201D\u2018\u2019\u02BF\u2212\u2013\u2014\u2026\uFD3E\uFD3F\u200B-\u200F\u0305\xAB\xBB]|<[^<>]*>)'
  const TASH = '[\u064B-\u0652\u0656\u0640\u0670\u06d6-\u06ed\u08f0-\u08f2]*'
  const HAMZ = 'آأإئؤء'

  //// regarding the arabic letters part below:
  //// make final-word alef after waw optional
  //// fold final-word heh <=> teh <=> teh marbuta
  //// fold alef => alef maqsura, alef hamza, alef hamza below, alef madd
  //// fold alef maqsura => alef, yeh, yeh hamza, alef hamza, alef hamza below
  //// fold yeh => alef maqsura, yeh hamza, alef hamza, alef hamza below
  //// fold waw => waw hamza
  //// fold any hamza letter => any other hamza letter, the plain letter of the original:
  ////    alef for أ إ آ
  ////    yeh and alef maqsura for ئ
  ////    waw for ؤ

  // if the query contains unescaped [] or {} or (), it's considered a regex and left alone,
  // otherwise it's considered a normal query and the app makes it "smart".
  const filter_query = (val) => val.match(/(?:^|[^\\])(?:\\\\)*[\[({]/) ? val : val
    //// disable metacharacters
    .replace(/[.+*?]/ig, '\\$&')  // [ { ( are escaped already
    //// roman letters
    .replace(/a/ig, '[āa]')
    .replace(/u/ig, '[ūu]')
    .replace(/i/ig, '[īi]')
    .replace(/h/ig, '[ḥh]')
    .replace(/s/ig, '[ṣs]')
    .replace(/t/ig, '[ṭt]')
    //// roman punctuation
    .replace(/'/g, '[\u2018\u2019\u02bf\'`]')
    .replace(/"/g, '[\u201C\u201D"]')
    .replace(/-/g, '[\u2212\u2013\u2014-]')
    .replace(/[.]{3}|\u2026/g, '(?:[.]{3}|\u2026)')
    //// make arabic less sensitive to schools of orthography (including the Quran in the Uthmani)
    //// adapted from search.js from my other project Recite: https://github.com/noureddin/recite/
    // note: w$ ~~ w, wa$ ~~ wa || w$ , w\b & wa\b ~~ wa?\b
    .replace(/و$/g,     '\0u')
    .replace(/وا$/g,    '\0W')
    .replace(/وا?(?:\\b|\s)/g, '\0U')  // todo: why ?: not ?=
    .replace(/[هتة](?=\\b|\s|$)/g, '\0T')
    .replace(/[اٱ]/g,   '\0A')
    .replace(/ى/g,      '\0Y')
    .replace(/ي/g,      '\0I')
    .replace(/\u06cc/g, '\0Y')  // farsi yeh
    .replace(/و/g,      '\0W')
    .replace(/[ٱآأإ]/g, '\0a')
    .replace(/ئ/g,      '\0i')
    .replace(/ؤ/g,      '\0w')
    .replace(/ء/g,      '\0x')
    // .replace(/ن/g,      '\0N')
    //
    .replace(/[ء-غف-ي]/g, '$&'+TASH)
    //
    .replace(/\0u/g, 'و'+TASH)                        // w$ matches w
    .replace(/\0W/g, 'و'+TASH+'(?:ا'+TASH+'|(?= ))')  // wa$ matches wa or w\b (space is \b)
    .replace(/\0U/g, 'و'+TASH+'(?:ا'+TASH+')? ')      // wa?\b matches wa?\b
    .replace(/\0T/g, '[هتة]'+TASH)
    .replace(/\0A/g, '[ٱاىأإآ\u0670]'+TASH)  // alefs, dagger alef, alef maqsura
    .replace(/\0Y/g, '[ايىئأإ\u0670\u06cc]'+TASH)  // like alef above, + yeh & farsi yeh
    .replace(/\0I/g, '[يىئ\u06cc]'+TASH)
    .replace(/\0W/g, '[وؤ]'+TASH)
    .replace(/\0a/g, '[ٱا\u0670'+HAMZ+']'+TASH)
    .replace(/\0i/g, '[يى'+HAMZ+']'+TASH)
    .replace(/\0w/g, '[و'+HAMZ+']'+TASH)
    .replace(/\0x/g, '['+HAMZ+']'+TASH)
    // .replace(/\0N/g, '[ن\u06E8]'+TASH)
    //// outer & inner spaces (matches spaces & punctuation)
    .replace(/^\s+/g, '(?:^|'+PUNT+'+)')
    .replace(/\s+$/g, '(?:$|'+PUNT+'+)')
    .replace(/\s+/g,          PUNT+'+')

  const dec_q = (q) => decodeURI(q)
  const enc_q = (q) => q.replace(/[\x01-\x20]/g, (ch) => encodeURIComponent(ch))

  function find_wrapper (ev) {
    if (ev && ev.type === 'keydown' && ev.key !== 'Enter') { return }
    //
    const qv = el_q.value.replace(/\s+/, ' ')
    if (qv.match(/^ *$/) != null) { return }
    //
    el_r.prepend(spinner)
    if (!load_all()) { setTimeout(find_wrapper, 100); return }
    setTimeout(really_find, 0, qv)  // not requestAnimationFrame
  }

  function are_arrays_equal (a, b) {
    // note: Array#sort() sorts the array *in place*, then returns the sorted array for added confusion
    return Array.from(a).sort().join('\0') === Array.from(b).sort().join('\0')
  }

  function really_find (qv) {
    const bks = bkk()
    const bhash = are_arrays_equal(bks, bids) ? '' : 'b=' + bks.join(',') + '&'
    set_hash(bhash + 'q=' + enc_q(qv))
    //
    const q = new RegExp(filter_query(qv), 'mi')
    const r = books.search(q, bks)
    if (r.length === 0) {
      el_r.innerHTML = '<center>تعذر إيجاد العبارة التي أدخلتها</center>'
      return
    }
    else {
      const x = r.length === 1000 ? 'ألف نتيجة بحث أو أزيد'
              : r.length  >    10 ? toarab(r.length) + ' نتيجة بحث'
              : r.length  >     2 ? toarab(r.length) + ' نتائچ بحث'
              : r.length ===    2 ? 'نتيجتا بحث اثنتان'
              : r.length ===    1 ? 'نتيجة بحث واحدة'
              :                     toarab(r.length) + ' نتيجة بحث'  // shouldn't happen, but whatever
      el_r.innerHTML = `<center>يوجد ${x}</center>`
      el_r.append(...range(r.length).map(j => create_block(q, ...r[j])))
    }
  }

  // search(false) => just enable search without loading any books; used in the reading mode
  // search() => enable search and load all (not unchecked) books; used in the first page
  // search(RegExp) => same as search() + start searching for the given regex
  function setup (q) {
    el_r.innerHTML = '' // _init_msg
    el_q.onkeydown = el_sb.onclick = find_wrapper
    if (q !== false) { load_all() }
    //
    if (q) { el_q.value = dec_q(q) }
    if (el_q.value) { find_wrapper() }  // if reloading the page, or a url param is given
  }

  return setup

}())

