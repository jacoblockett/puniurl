document.addEventListener('keyup', event => {
  if (event.keyCode === 13) {
    event.preventDefault()
    process()
  }
})

async function process() {
  const input = document.getElementById('urlInput')
  const btn = document.getElementById('urlBtn')
  const curBtnInner = btn.innerHTML

  btn.innerHTML = '<div class="loader"></span>'

  const resp = await fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrer: 'no-referrer',
    body: JSON.stringify({url: input.value})
  })
  const json = await resp.json()

  if (!json.error) {
    window.location.href = '/processed'
  } else {
    const msg = document.getElementById('msg')
    
    btn.innerHTML = curBtnInner
    msg.classList.remove('no-show')
    msg.innerHTML = "Please use a valid url"
  }
}

function copy() {
  const input = document.getElementById('urlInput')

  input.select()
  document.execCommand('copy')
  document.getElementById('urlBtn').innerHTML = 'Copied!'
}
