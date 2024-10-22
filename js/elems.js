const nextbtn = make_elem('div', { id: 'nextbtn', className: 'bigbtn' }, [
  make_svgelem('svg', { viewBox: '-5 -5 80 60' }, [
    make_svgelem('polygon', { points: '35,50 70,0 0,0' })
  ])
])

const prevbtn = make_elem('div', { id: 'prevbtn', className: 'bigbtn' }, [
  make_svgelem('svg', { viewBox: '-5 -5 80 60' }, [
    make_svgelem('polygon', { points: '35,0 0,50 70,50' })
  ])
])

const spinner = make_svgelem('svg', { id: 'spinner-svg', viewBox: '-50 -50 100 100' }, [
  make_svgelem('circle', { id: 'spinner', cx: 0, cy: 0, r: 35, fill: 'none', 'stroke-width': '10', 'stroke-dasharray': '40 30' }),
])

// CC0 from https://www.svgrepo.com/svg/419058/book-reading-learning
// optimized with https://vecta.io/nano then manually modified a bit
const readsvg = '<a class="bh read"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>اقرأ في السياق</title><path d="M32.042 21.613c-.27 0-.538-.108-.735-.321a1 1 0 0 1 .057-1.413c3.078-2.844 9.794-2.482 12.819-.854a1 1 0 0 1-.948 1.761c-2.413-1.3-8.205-1.569-10.515.562a1 1 0 0 1-.678.265z"/><path d="M32.041 21.613c-.242 0-.485-.088-.678-.266-2.31-2.132-8.102-1.861-10.514-.562a1 1 0 0 1-.948-1.761c3.025-1.629 9.741-1.988 12.819.854a1 1 0 0 1-.679 1.735zM15.752 46.229c-.331 0-.654-.163-.844-.463a1 1 0 0 1 .306-1.381c4.372-2.784 14.249-2.345 17.391.048a1 1 0 0 1 .19 1.401 1 1 0 0 1-1.401.19c-2.541-1.933-11.542-2.222-15.106.048-.166.106-.352.157-.536.157zm-.02-21.208a1 1 0 0 1-.475-1.88c1.241-.668 3.08-1.115 5.044-1.226a.99.99 0 0 1 1.055.941 1 1 0 0 1-.942 1.055c-1.658.094-3.232.465-4.209.991-.151.081-.313.119-.473.119zm16.31 16.687c-.27 0-.538-.108-.735-.321a1 1 0 0 1 .057-1.413c3.079-2.843 9.795-2.482 12.819-.854a1 1 0 0 1-.948 1.761c-2.413-1.3-8.204-1.569-10.515.562a1 1 0 0 1-.678.265z"/><path d="M32.041 41.708c-.242 0-.485-.088-.678-.266-2.311-2.132-8.101-1.861-10.514-.562a1 1 0 0 1-.948-1.761c3.025-1.629 9.74-1.988 12.819.854a1 1 0 0 1-.679 1.735z"/><path d="M32 46.229a1 1 0 0 1-1-1V20.53a1 1 0 1 1 2 0v24.698a1 1 0 0 1-1 1.001z"/><use href="#B"/><use href="#B" x="-23.354"/><path d="M15.751 46.229a1 1 0 0 1-1-1l-.024-12.446-.018-8.61a1 1 0 1 1 2 0l.018 8.604.024 12.452a1 1 0 0 1-1 1zm32.497 0a1 1 0 0 1-.536-.156c-3.564-2.27-12.565-1.98-15.106-.048a1 1 0 0 1-1.401-.19 1 1 0 0 1 .19-1.401c3.143-2.391 13.017-2.833 17.391-.048a1 1 0 0 1-.538 1.843z"/><path d="M48.249 46.229a1 1 0 0 1-1-1l.024-12.452.018-8.604a1 1 0 1 1 2 0l-.018 8.61-.024 12.446a1 1 0 0 1-1 1z"/><path d="M48.268 25.172c-.16 0-.322-.038-.473-.119-.912-.492-2.38-.855-3.927-.973a1 1 0 0 1-.921-1.073.99.99 0 0 1 1.073-.921c1.839.14 3.561.579 4.724 1.205a1 1 0 0 1-.476 1.881zm-12.018.088a1 1 0 0 1-.378-1.926c1.081-.44 2.588-.466 3.749-.061a1 1 0 0 1 .615 1.273 1 1 0 0 1-1.274.615c-.7-.245-1.704-.233-2.334.023-.124.052-.252.076-.378.076zm0 4.018a1 1 0 0 1-.378-1.926c1.08-.44 2.586-.464 3.749-.06a1 1 0 0 1 .615 1.273 1 1 0 0 1-1.274.615c-.701-.244-1.704-.235-2.334.022-.124.053-.252.076-.378.076zm0 4.363a1 1 0 0 1-.378-1.926c1.08-.441 2.586-.465 3.749-.06a1 1 0 0 1 .615 1.273 1 1 0 0 1-1.274.615c-.701-.244-1.704-.234-2.334.022-.124.052-.252.076-.378.076zm-11.562-8.416a1 1 0 0 1-.378-1.926c1.081-.44 2.588-.466 3.749-.061a1 1 0 0 1 .615 1.273 1 1 0 0 1-1.274.615c-.699-.244-1.703-.233-2.334.023a.98.98 0 0 1-.378.076zm0 4.019a1 1 0 0 1-.378-1.926c1.081-.441 2.588-.466 3.749-.061a1 1 0 0 1 .615 1.273c-.182.522-.75.799-1.274.615-.699-.245-1.703-.233-2.334.023a.96.96 0 0 1-.378.076zm0 4.361a1 1 0 0 1-.378-1.926c1.08-.44 2.586-.465 3.749-.06a1 1 0 0 1 .615 1.273 1 1 0 0 1-1.274.615c-.7-.244-1.704-.234-2.334.022a.96.96 0 0 1-.378.076z"/><defs ><path id="B" d="M43.75 40.863a1 1 0 0 1-1-1l-.024-11.785-.018-8.114a1 1 0 1 1 2 0l.018 8.107.024 11.792a1 1 0 0 1-1 1z"/></defs></svg></a>'

// CC0 from https://www.svgrepo.com/svg/501233/info-borderless
// optimized with https://vecta.io/nano then manually modified a bit
const infosvg = '<a class="bh info"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920"><path d="M1229.93 594.767c36.644 37.975 50.015 91.328 43.72 142.909-9.128 74.877-30.737 144.983-56.093 215.657l-82.332 226.512-132.65 362.1c-10.877 30.018-18.635 62.072-21.732 93.784-3.376 34.532 21.462 51.526 52.648 36.203 24.977-12.278 49.288-28.992 68.845-48.768l94.805-97.98 45.912-50.438c11.993-13.583 24.318-34.02 40.779-42.28 31.17-15.642 55.226 22.846 49.582 49.794-5.39 25.773-23.135 48.383-39.462 68.957l-1.123 1.416a1559.53 1559.53 0 0 0-4.43 5.6c-54.87 69.795-115.043 137.088-183.307 193.977-67.103 55.77-141.607 103.216-223.428 133.98-26.65 10.016-53.957 18.253-81.713 24.563-53.585 12.192-112.798 11.283-167.56 3.333-40.151-5.828-76.246-31.44-93.264-68.707-29.544-64.698-8.98-144.595 6.295-210.45 18.712-80.625 46.8-157.388 75.493-234.619l2.18-5.867 1.092-2.934 2.182-5.87 2.182-5.873 101.727-267.797 93.69-243.95c2.364-6.216 5.004-12.389 7.669-18.558l1-2.313c6.835-15.806 13.631-31.617 16.176-48.092 6.109-39.537-22.406-74.738-61.985-51.947-68.42 39.4-119.656 97.992-170.437 156.944l-6.175 7.17-47.908 54.286c-16.089 17.43-35.243 39.04-62.907 19.07-29.521-21.308-20.765-48.637-3.987-71.785 93.18-128.58 205.056-248.86 350.86-316.783 60.932-28.386 146.113-57.285 225.882-58.233 59.802-.707 116.561 14.29 157.774 56.99zm92.038-579.94c76.703 29.846 118.04 96.533 118.032 190.417-.008 169.189-182.758 284.908-335.53 212.455-78.956-37.446-117.358-126.202-98.219-227.002 26.494-139.598 183.78-227.203 315.717-175.87z"/></svg></a>'

// the favicon is based on the CC0 icon https://www.svgrepo.com/svg/289470/books
// optimized with https://vecta.io/nano then manually modified
// it is at static/favicon.svg

function change_dark () {
  // if the user changed the dark selector, remember their preference
  if (el_dark.checked) {
    B.classList.add('dark')
    S.setItem('dark', 'Y')
  }
  else {
    B.classList.remove('dark')
    S.setItem('dark', 'N')
  }
}

function init_dark () {
  // no overriding; follow system preference initially
  const dark = S.getItem('dark') == null
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : S.getItem('dark') === 'Y'
        // ^ the user changed the dark selector
  B.classList.toggle('dark', dark)
  el_dark.checked = dark
}

