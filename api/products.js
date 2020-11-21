const Shopify = require("shopify-api-node")
const geo = require("../geo/geo")

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOPNAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_SECRET
})

const getEcoScore = async (farmerID, hubID) => {

  const co2PerKm = 128.1

  const distance = await geo.getDistanceFromHubToFarmer(farmerID, hubID)
  const co2 = distance * co2PerKm
  const ranking = Math.max(1 - (co2 / 18000), 0)

  return { 
    distance, 
    co2, 
    ranking 
  }
}

const getProducts = async (req, res) => {

  const db = process.mongoClient.db

  let products = []

  const allProducts = await shopify.product.list()

  for(const product of allProducts){

    const details = JSON.parse(product.body_html)

    const { hubID } = details

    console.log(hubID,  req.custom.username)

    const distance = 30//await geo.getDistanceFromHubToUser(hubID, req.custom.username)

    if(distance < process.global.maxDistanceFromHub){

      const { description, farmerID, unit } = details

      const [ farmerDetails ] = await db.collection("farmers").find({ farmerID }).toArray()

      const ecoScore = getEcoScore(farmerID, hubID)

      products.push({
        id: String(product.id),
        title: product.title,
        description,
        ecoScore,
        price: parseFloat(product.variants[0].price),
        quantity: product.variants[0].quantity,
        unit,
        farmerDetails,
        images: product.images.map(i => i.src),
        category: "Obst"
      })
    }
  }

  res.json({ products })
}

module.exports.test = async () => {

  for(let i = 1; i<=3; i++){
    for(let j=1; j<=5; j++){
      const a = await getEcoScore(j,i)
      console.log(a.ranking)
    }
  }
}

module.exports.getProducts = getProducts