
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

const hide_el = (el) => { el.style.visibility = 'hidden';  el.style.opacity = '0' }
const show_el = (el) => { el.style.visibility = 'visible'; el.style.opacity = '1' }

function make_elem (tag, opts={}) {
  const el = document.createElement(tag)
  for (let opt in opts)
    if (opt === 'Classes')
      el.classList.add(...opts.Classes.split(/\s+/))
    else if (opt === 'Dataset')
      for (let k in opts.Dataset)
        el.dataset[k] = opts.Dataset[k]
    else if (opt === 'Children')
      el.append(...opts.Children)
    else
      el[opt] = opts[opt]
  return el
}

function make_svgelem (tag, attrs={}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag)
  for (let attr in attrs)
    if (attr === 'Children')
      el.append(...attrs.Children)
    else
      el.setAttribute(attr, attrs[attr])
  return el
}

function mk_el (tag, innerHTML) { const el = document.createElement(tag); el.innerHTML = innerHTML; return el }


// tr num & fields()
// TODO see: https://stackoverflow.com/q/10726638

const toarab = (n) =>  // remove non-numerals and convert numerals to Eastern Arabic
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
      .replace(/[^٠١٢٣٤٥٦٧٨٩]/g, '')

const toascii = (n) =>  // convert numerals to ASCII
  n
      .replace(/٠/g, '0')
      .replace(/١/g, '1')
      .replace(/٢/g, '2')
      .replace(/٣/g, '3')
      .replace(/٤/g, '4')
      .replace(/٥/g, '5')
      .replace(/٦/g, '6')
      .replace(/٧/g, '7')
      .replace(/٨/g, '8')
      .replace(/٩/g, '9')

