const express = require("express")
const { basicAuthDecode } = require("../util/basicauth")
const accountsAPI = require("./accounts")
const productsAPI = require("./products")
const ordersAPI = require("./orders")
const geoAPI = require("./geo")

const router = express.Router()

const verifyRequest = async (username, passwordHash) => {

  const db = process.mongoClient.db

  const [ account = null ] = await db.collection("accounts").find({ username, passwordHash }).toArray()

  return account ? true : false
}

const handleRequest = async (req, res, callback) => {

  const { authorization = null } = req.headers

  if(!authorization) return;

  const [ username = null, passwordHash = null ] = basicAuthDecode(authorization)

  if(!username || !passwordHash) return;

  const authResponse = await verifyRequest(username, passwordHash)

  if(!authResponse){
    console.log("auth failed")
    res.status(401).end()
    return;
  }

  console.log("auth success")

  req.custom = { username }
  
  console.log({req})

  callback(req, res)
}


router.post('/account', (req, res) => accountsAPI.createAccount(req, res))
router.post('/login', (req, res) => accountsAPI.signIn(req, res))

router.get('/loading', (req, res) => handleRequest(req, res, () => geoAPI.getLoadingScreenImage(req, res)))
router.post('/order', (req, res) => handleRequest(req, res, () => ordersAPI.createOrder(req, res)))
router.get('/products', (req, res) => handleRequest(req, res, () => productsAPI.getProducts(req, res)))
router.post('/location', (req, res) => handleRequest(req, res, () => geoAPI.getUserLocation(req, res)))

module.exports = router;
