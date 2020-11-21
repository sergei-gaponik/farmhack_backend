const geo = require("../geo/geo")

const getUserLocation = async (req, res) => {

  const response = await geo.getLocationFromAddress(req.body.address)

  res.json(response)
}

const getLoadingScreenImage = async (req, res) => {

  const db = process.mongoClient.db
  const username = req.custom.username

  const [ account ] = await db.collection("accounts").find({ username }).toArray()

  const response = await geo.getMapSnapshot(account.location)

  return response
}

module.exports.getLoadingScreenImage = getLoadingScreenImage
module.exports.getUserLocation = getUserLocation