const geo = require("../geo/geo")

const getUserLocation = async (req, res) => {

  const response = await geo.getLocationFromAddress(req.body.address)

  res.json(response)
}

const getLoadingScreenImage = async (req, res) => {

  const db = process.mongoClient.db
  const username = req.custom.username

  const [ account ] = await db.collection("accounts").find({ username }).toArray()

  res.json({
    status: "success",
    imageURL: account.mapSnapshot
  })
}

module.exports.getLoadingScreenImage = getLoadingScreenImage
module.exports.getUserLocation = getUserLocation