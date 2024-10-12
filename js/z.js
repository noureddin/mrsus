
// bids, defined in the build script, is the sorted array of ids of books
const trid = (bid) => meta[bid][''].O || Object.keys(meta[bid]).sort()  // ids of translations (+ '')

const books = (function () {

  let ints = new Map()

  const xz = new Map()  // set, get, has
  // xz contains the compressed files;
  // because we don't keep the UNcompressed files in the memory for long,
  // because they are big (eg, the full quran file with translation
  // is 1.2MB compressed, but 6MB uncompressed)

  const txt = new Map()  // the uncompressed books

  const unpack = (bid) =>
    deserialize(trid(bid), LZMA.decompress(xz.get(bid)))

  const access = (bid) => {
    if (txt.has(bid)) {
      clearTimeout(ints.get(bid))
      ints.delete(bid)
      ints.set(bid, setTimeout(() => txt.delete(bid), 10_000))
      return txt.get(bid)
    }
    else if (xz.has(bid)) {
      const bk = unpack(bid)
      txt.set(bid, bk)
      ints.set(bid, setTimeout(() => txt.delete(bid), 10_000))
      return bk
    }
    else {
      throw "Book not loaded: " + bid
    }
  }

  const loading = new Set()  // add, delete, has

  const get = (bid) => {
    const lzma_file = bid + '.lzma?h=' + hash[bid]
    if (loading.has(bid)) { return }
    if (xz.has(bid)) { return }
    loading.add(bid)
    fetch(lzma_file)
      .then((res) => res.ok ? res.arrayBuffer() : null)
      .then((buf) => {
        loading.delete(bid)
        xz.set(bid, new Uint8Array(buf))
      })
  }

  return {

    access,

    load: (bid) => {
      get(bid)
      return xz.has(bid)  // return true if loaded
    },

    load_many: (bs) => {  // return true if loaded all specified books
      for (let bid of bs) { get(bid) }
      return bs.length === bs.reduce((acc, bid, i) => acc + (xz.has(bid) ? 1 : 0), 0)
    },

    load_all: () => {
      for (let bid of bids) { get(bid) }
      return xz.size === bids.length  // return true if loaded all
    },

    search: (regex, _bids=bids) => {
      const m = []
      for (let bid of _bids) {
        const bk = access(bid)
        for (let i = 0; i < bk.length; ++i) {
          let mt = []
          for (let tid of trid(bid)) {
            if (bk[i][tid].match(regex)) { mt.push(tid) }
          }
          if (mt[0] === '') { mt = trid(bid) }  // if the source matches, bring all translations
          if (mt.length) { m.push([bid, i, mt]) }
          if (m.length >= 1000) { return m }
        }
      }
      return m
    },

  }
})()

