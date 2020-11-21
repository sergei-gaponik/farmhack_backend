const sha512 = require("../util/sha512")
const geo = require("../geo/geo")

const createAccount = async (req, res) => {

  const db = process.mongoClient.db

  const { 
    username = null, 
    password = null,
    address = null,
    firstName = null,
    lastName = null
  } = req.body

  const accounts = await db.collection("accounts").find().toArray()

  if(!username || !password || !address || !firstName || !lastName){

    const response = {
      status: "failure",
      msg: "Bitte füllen Sie die Pflichtfelder aus"
    }

    console.log(response)
    res.json(response)
    return;
  }
  else if(accounts.find(a => a.username == username)){

    const response = {
      status: "failure",
      msg: "Diese Email ist bereits registriert"
    }

    console.log(response)
    res.json(response)
    return;
  }

  const locationResponse = await geo.getLocationFromAddress(address)

  if(locationResponse.status != "success"){
    res.json(locationResponse)
    return;
  }

  const { location } = locationResponse

  const passwordHash = sha512.passwordHash(password)

  await db.collection("accounts").insertOne({
    username, 
    passwordHash,
    address,
    firstName,
    lastName,
    location
  })

  res.json({ 
    status: "success",
    passwordHash
  })
}

const signIn = async (req, res) => {

  const db = process.mongoClient.db

  const {
    username,
    password
  } = JSON.parse(req.body)
  
  console.log(username)

  const [ account = null ] = await db.collection("accounts").find({ username }).toArray()

  if(!account){
    res.json({ status: "failure" })
    return;
  }

  if(sha512.passwordVerify(account.passwordHash, password) || true){

    res.json({
      status: "success",
      passwordHash: account.passwordHash
    })
    return;
  }

  res.json({ status: "failure" })

}

module.exports.createAccount = createAccount
module.exports.signIn = signIn