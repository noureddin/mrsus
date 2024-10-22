
function Q    (selector) { return document.querySelector(selector) }
function Qall (selector) { return document.querySelectorAll(selector) }
function Qid  (id)       { return document.getElementById(id) }

const say = console.log

const range = (n) => n ? [...Array(n).keys()] : []


// // prototype shorthands
// Array.prototype.L = Array.prototype.length
// String.prototype.R = String.prototype.replace
// Element.prototype.A = Element.prototype.append
// Element.prototype.Q    = Element.prototype.querySelector
// Element.prototype.Qall = Element.prototype.querySelectorAll
// Element.prototype.Qid  = Element.prototype.getElementById


const B = document.body
const S = localStorage
const L = location


// DOM-related

function make_elem (tag, opts={}, children=[]) {
  const el = document.createElement(tag)
  for (let opt in opts)
    el[opt] = opts[opt]
  el.append(...children)
  return el
}

function make_svgelem (tag, attrs={}, children=[]) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag)
  for (let attr in attrs)
    el.setAttribute(attr, attrs[attr])
  el.append(...children)
  return el
}


// tr num & fields()
// TODO see: https://stackoverflow.com/q/10726638

const toarab = (n) =>  // convert numerals to Eastern Arabic
  n.toString()
      .replace(/[0٠]/g, '٠')
      .replace(/[1١]/g, '١')
      .replace(/[2٢]/g, '٢')
      .replace(/[3٣]/g, '٣')
      .replace(/[4٤]/g, '٤')
      .replace(/[5٥]/g, '٥')
      .replace(/[6٦]/g, '٦')
      .replace(/[7٧]/g, '٧')
      .replace(/[8٨]/g, '٨')
      .replace(/[9٩]/g, '٩')

