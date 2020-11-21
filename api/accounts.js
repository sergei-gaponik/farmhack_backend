const sha512 = require("../util/sha512")

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

  const locationResponse = await getLocationFromAddress(address)

  if(locationResponse.status != "success"){
    res.json(locationResponse)
    return;
  }

  const { location } = locationResponse

  await db.collection("accounts").insertOne({
    username, 
    passwordHash: sha512.passwordHash(password),
    address,
    firstName,
    lastName,
    location
  })

  res.json({ status: "success" })
}

const signIn = async (req, res) => {

  const db = process.mongoClient.db

  const {
    username,
    password
  } = req.body

  const [ account = null ] = db.collection("accounts").find({ username }).toArray()

  if(!account){
    res.json({ status: "failure" })
  }

  if(sha512.passwordVerify(account.passwordHash, password)){

    res.json({
      status: "success",
      passwordHash: account.passwordHash
    })

  }

  res.json({ status: "failure" })

}

module.exports.createAccount = createAccount
module.exports.signIn = signIn