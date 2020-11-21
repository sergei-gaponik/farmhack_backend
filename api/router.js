const express = require("express")
const { basicAuthDecode } = require("../util/basicauth")
const accountsAPI = require("./accounts")
const productsAPI = require("./products")

const router = express.Router()

const verifyRequest = async authorization => {

  if(!authorization) return false

  const db = process.mongoClient.db
  const [ username = null, password = null ] = basicAuthDecode(authorization)

  if(!username || !password) return false

  const [ account = null ] = await db.collection("accounts").find({ username, password }).toArray()

  return account ? true : false
}

const handleRequest = async (req, res, callback) => {

  const { authorization = null } = req.headers
  const authResponse = await verifyRequest(authorization)

  if(!authResponse){
    console.log("auth failed")
    res.status(401).end()
    return;
  }

  console.log("auth success")
  
  callback(req, res)
}


router.post('/account', (req, res) => accountsAPI.createAccount(req, res))

router.post('/products', (req, res) => handleRequest(req, res, () => productsAPI.getProducts(req, res)))


module.exports = router;
