const dotenv = require('dotenv').config()
const parse = require('url-parse')
const express = require('express')
const admin = require('firebase-admin')
const app = express()
const urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
let database

if (database === undefined) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://puniurl.firebaseio.com'
  })
  database = admin.firestore()
}

app.use(express.static(__dirname + '/public'))
app.use('/', express.json({limit: '1mb'}))

app.get('/', (req, res) => res.render('index'))

app.post('/', async (req, res) => {
  const good = urlReg.test(req.body.url)

  if (good) {
    const snapshot = await database.collection('addresses').where('href', '==', req.body.url).get()

    console.log(snapshot)

    //check if url exists already
      //return existing url if it does
    //update docs if it doesn't
  } else {
  }
  res.send({error: true})
})

app.listen(3000)
