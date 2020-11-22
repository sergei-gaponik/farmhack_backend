const geolib = require("geolib")
const fetch = require("node-fetch")
const fs = require("fs")
const path = require("path")

const getMapSnapshot = async location => {

  const center = `${location.latitude},${location.longitude}`

  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=11&size=1080x1920&maptype=roadmap&markers=color:red%7C${center}&key=${process.env.GOOGLE_API_KEY}&scale=2`

  const res = await fetch(url)
  const buffer = await res.buffer()
  
  const fileName = `maps_${Date.now().toString(36)}.png`

  await fs.promises.writeFile(path.join(__dirname, `../assets/public/maps/${fileName}`), buffer)

  return {
    status: "success",
    imageURL: `http://h2876877.stratoserver.net/assets/maps/${fileName}`
  }
}

const getLocationFromAddress = async address => {

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=${process.env.GOOGLE_API_KEY}`

  const res = await fetch(url)
  const data = await res.json()

  if(!data.results.length){
    return {
      status: "failure",
      msg: "Addresse nicht gefunden"
    }
  }
  else if(data.results.length > 1){
    return {
      status: "failure",
      msg: "Addresse nicht eindeutig"
    }
  }

  return {
    status: "success",
    location: {
      latitude: data.results[0].geometry.location.lat,
      longitude: data.results[0].geometry.location.lng
    }
  }
}

const getDistanceFromHubToFarmer = async (farmerID, hubID) => {

  const db = process.mongoClient.db

  const [ farmerDetails ] = await db.collection("farmers").find({ farmerID }).toArray()
  const [ hub ] = await db.collection("hubs").find({ hubID }).toArray()

  return parseFloat(geolib.getDistance(farmerDetails.location, hub.location) / 1000)
}

const getDistanceFromHubToUser = async (username, hubID) => {

  const db = process.mongoClient.db

  const [ account ] = await db.collection("accounts").find({ username }).toArray()
  const [ hub ] = await db.collection("hubs").find({ hubID }).toArray()

  return parseFloat(geolib.getDistance(account.location, hub.location) / 1000)
}

module.exports.test = async () => {
  const res = await getMapSnapshot({ latitude: 51.152648, longitude: 13.563702 })

  console.log(res)
}

module.exports.getMapSnapshot = getMapSnapshot
module.exports.getDistanceFromHubToFarmer = getDistanceFromHubToFarmer
module.exports.getDistanceFromHubToUser = getDistanceFromHubToUser
module.exports.getLocationFromAddress = getLocationFromAddress