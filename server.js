require('dotenv').config()
const PORT = process.env.PORT || 3000
const express = require('express')
const helmet = require('helmet')
const admin = require('firebase-admin')
const app = express()
const crs = require('crypto-random-string')
const urlReg = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'i')
const protocolReg = new RegExp(/^https?:\/\//, 'i')
const domainName = 'http://puniurl.com/'
let database, linkToGive

if (database === undefined) {
  const { TYPE, PROJECT_ID, PRIVATE_KEY_ID, PRIVATE_KEY, CLIENT_EMAIL, CLIENT_ID, AUTH_URI, TOKEN_URI, AUTH_PROVIDER_X509_CERT_URL, CLIENT_X509_CERT_URL, DATABASE_URL } = process.env

  admin.initializeApp({
    credential: admin.credential.cert({
      type: TYPE,
      project_id: PROJECT_ID,
      private_key_id: PRIVATE_KEY_ID,
      private_key: PRIVATE_KEY.replace(/\\n/g, '\n'), //https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse
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

app.set('view engine', 'pug')
app.set('port', 3000)

app.use(helmet.hidePoweredBy({setTo: 'PHP 4.2.0'}))
app.use('/', express.json({limit: '1mb'}))
app.use(express.static(__dirname + '/public'))

app.get('/:id', async (req, res) => {
  if (req.params.id === 'processed') {
    if (linkToGive) {
      return res.render('index', {view: 'processed', urlval: linkToGive})
    } else {
      return res.redirect('/')
    }
  } else {
    const col = database.collection('addresses')
    const snapshot = await col.where('puni', '==', req.params.id).get()
  
    if (snapshot.size === 1) {
      const href = snapshot.docs[0].get('href')
  
      if (protocolReg.test(href)) {
        return res.redirect(href)
      } else {
        return res.redirect(`http://${href}`)
      }
    } else {
      return res.render('404')
    }
  }
})
app.get('/', (req, res) => res.render('index', {view: 'index'}))

app.post('/', async (req, res) => {
  if (urlReg.test(req.body.url)) {
    const normalizedUrl = req.body.url.toLowerCase()
    const col = database.collection('addresses')
    const snapshot = await col.where('href', '==', normalizedUrl).get()
    
    if (snapshot.size === 1) {
      linkToGive = `${domainName}${snapshot.docs[0].get('puni')}`
      return res.send({error: null, processed: linkToGive})
    } else {
      const puni = await givePuni(col)

      linkToGive = `${domainName}${puni}`
      col.doc().set({href: normalizedUrl, puni})

      return res.send({error: null, processed: linkToGive})
    }
  } else {
    return res.send({error: 'BAD_URL'})
  }
})

app.listen(PORT)
