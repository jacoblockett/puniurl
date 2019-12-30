const urlInput = document.getElementById('urlInput')
const btn = document.getElementById('urlBtn')
let enterAllowed = true

if (urlInput) {
  urlInput.addEventListener('keyup', event => {
    if (event.keyCode === 13 && enterAllowed) {
      event.preventDefault()
      process()
    }
  })
}

async function process() {
  enterAllowed = false
  const curBtnInner = btn.innerHTML

  btn.innerHTML = '<div class="loader"></span>'

  const resp = await fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrer: 'no-referrer',
    body: JSON.stringify({url: urlInput.value})
  })
  const json = await resp.json()

  if (!json.error) {
    window.location.href = '/processed'
  } else {
    const msg = document.getElementById('msg')
    
    btn.innerHTML = curBtnInner
    msg.classList.remove('no-show')
    msg.innerHTML = "Please use a valid url"
    enterAllowed = true
  }
}

function copy() {
  const output = document.getElementById('urlOutput')

  output.select()
  document.execCommand('copy')
  btn.innerHTML = 'Copied!'
}
