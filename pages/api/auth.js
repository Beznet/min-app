const { MongoClient } = require('mongodb')
const assert = require('assert')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const client = new MongoClient(process.env.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

function findUser(db, email, callback) {
  const collection = db.collection('user')
  collection.findOne({ email }, callback)
}

function authUser(db, email, password, hash, callback) {
  bcrypt.compare(password, hash, callback)
}

export default (req, res) => {
  if (req.method === 'POST') {
    //login
    try {
      assert.notEqual('', req.body.email, 'Email required')
      assert.notEqual('', req.body.password, 'Password required')
    } catch (bodyError) {
      return res.status(403).send({ error: true, message: bodyError.message })
    }

    client.connect(function (err) {
      assert.equal(null, err)
      console.log('Connected to MongoDB server =>')
      const db = client.db(process.env.DB_NAME)
      const email = req.body.email
      const password = req.body.password

      findUser(db, email, function (err, user) {
        if (err) {
          res.status(500).json({ error: true, message: 'Error finding User' })
          return
        }
        if (!user) {
          res.status(404).json({ error: true, message: 'User not found' })
          return
        } else {
          authUser(db, email, password, user.password, function (err, match) {
            if (err) {
              res.status(500).json({ error: true, message: 'Auth Failed' })
              return
            }
            if (match) {
              const listData = user.list
              const token = jwt.sign(
                { userId: user.userId, email: user.email },
                process.env.JWT_SECRET,
                {
                  expiresIn: 3000, //50 minutes
                },
              )
              res.status(200).json({ token, listData })
              return
            } else {
              res.status(401).json({ error: true, message: 'Wrong Password' })
              return
            }
          })
        }
      })
    })
  } else {
    // Handle any other HTTP method
    res.statusCode = 401
    res.end()
  }
}
