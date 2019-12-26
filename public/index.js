async function process() {
  const input = document.getElementById('urlInput')
  console.log(input.value)
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
    //set danger color on input and button
  }
}

function copy() {

}
