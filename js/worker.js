importScripts('fzstd-0.1.1.js'); const ext = '.zst?h='; const dec = (u8buf) => (new TextDecoder).decode(fzstd.decompress(u8buf))
// importScripts('lzma-d-min.js'); const ext = '.lzma?h='; const dec = LZMA.decompress

const loading = new Set()  // add, delete, has

onmessage = (ev) => {
  const [bid, hash] = ev.data
  const file = bid + ext + hash
  if (loading.has(bid)) { return }
  loading.add(bid)
  fetch(file)
    .then((res) => res.ok ? res.arrayBuffer() : null)
    .then((buf) => {
      loading.delete(bid)
      postMessage([bid, dec(new Uint8Array(buf))])
    })
}
