'use strict'

function deserialize (ids, text) {  // ids include '' for the source book
  ids = Array.from(ids).sort()
  // .sort() b/c they can be in a "humanly order";
  // but this is just a piece of presentational metadata,
  // and doesn't affect the actual content.
  // Array.from() because Array#sort() sorts the array *in place*,
  // then returns the sorted array for added confusion.
  const I = ids.length
  const lines = text.split('\n')
  const body = []
  let b = -1
  for (let i = 0; i < lines.length; ++i) {
    const j = i % I
    if (j) { body[b][ids[j]] = lines[i] }
    else   { body.push({'':lines[i]}); ++b }
  }
  return body
}

