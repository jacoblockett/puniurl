require('dotenv').config()
const express = require('express')
const admin = require('firebase-admin')
const app = express()
const crs = require('crypto-random-string')
const urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
const domainName = 'puniurl.com/'
let database

if (database === undefined) {
  const { TYPE, PROJECT_ID, PRIVATE_KEY_ID, PRIVATE_KEY, CLIENT_EMAIL, CLIENT_ID, AUTH_URI, TOKEN_URI, AUTH_PROVIDER_X509_CERT_URL, CLIENT_X509_CERT_URL, DATABASE_URL } = process.env

  admin.initializeApp({
    credential: admin.credential.cert({
      type: TYPE,
      project_id: PROJECT_ID,
      private_key_id: PRIVATE_KEY_ID,
      private_key: PRIVATE_KEY,
      client_email: CLIENT_EMAIL,
      client_id: CLIENT_ID,
      auth_uri: AUTH_URI,
      token_uri: TOKEN_URI,
      auth_provider_x509_cert_url: AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: CLIENT_X509_CERT_URL,
    }),
    databaseURL: DATABASE_URL
  })
  database = admin.firestore()
}

async function givePuni(col) {  
  const puniurl = crs({type: 'url-safe', length: 8})
  const snapshot = await col.where('puni', '==', puniurl).get()

  if (snapshot.size === 1) {
    return givePuni(col)
  } else {
    return puniurl
  }
}

app.use(express.static(__dirname + '/public'))
app.use('/', express.json({limit: '1mb'}))

app.get('/', (req, res) => res.render('index'))

app.post('/', async (req, res) => {
  const good = urlReg.test(req.body.url)

  if (good) {
    const col = database.collection('addresses')
    const snapshot = await col.where('href', '==', req.body.url).get()
    
    if (snapshot.size === 1) {
      return res.send({error: null, processed: `${domainName}${snapshot.docs[0].get('puni')}`})
    } else {
      const puni = await givePuni(col)
      console.log(puni)

      col.doc().set({
        href: req.body.url,
        puni
      })
      return res.send({error: null, processed: `${domainName}${puni}`})
    }
  } else {
    console.log('good:', good)
    console.log('given', req.body.url)
    //gives a false bad_url: to replicate, submit a good url, then submit a separate good url. The separate good url will fail on first submit, but succeed on second submit. figure out why
    return res.send({error: 'BAD_URL'})
  }
})

app.listen(3000)
