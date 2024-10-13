
if (!window.Worker) { throw 'Web workers are not supported' }

// bids, defined in the build script, is the sorted array of ids of books
const trid = (bid) => meta[bid][''].O || Object.keys(meta[bid]).sort()  // ids of translations (+ '')

const books = (function () {

  const txt = new Map()  // the uncompressed books

  const access = (bid) => {
    if (txt.has(bid)) {
      return txt.get(bid)
    }
    else {
      throw "Book not loaded: " + bid
    }
  }

  const w = new Worker('worker.js')

  w.onmessage = (ev) => {
    const [bid, text] = ev.data
    txt.set(bid, deserialize(trid(bid), text))
  }

  const get = (bid) => {
    w.postMessage([bid, hash[bid]])
  }

  return {

    access,

    load: (bid) => {
      get(bid)
      return txt.has(bid)  // return true if loaded
    },

    load_many: (bs) => {  // return true if loaded all specified books
      for (let bid of bs) { get(bid) }
      return bs.length === bs.reduce((acc, bid, i) => acc + (txt.has(bid) ? 1 : 0), 0)
    },

    load_all: () => {
      for (let bid of bids) { get(bid) }
      return txt.size === bids.length  // return true if loaded all
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

