const { Db } = require("mongodb")
const Shopify = require("shopify-api-node")
const geo = require("../geo/geo")

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOPNAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_SECRET
})

const getProducts = async (req, res) => {

  const db = process.mongoClient.db

  let products = []

  const allProducts = await shopify.product.list()

  for(const product of allProducts){

    const details = JSON.parse(product.body_html)

    const { hubID } = details
    const distance = await geo.getDistanceFromHub(hubID, req.custom.username)

    if(distance < process.global.maxDistanceFromHub){

      const { description, farmerID, unit } = details

      const [ farmerDetails ] = await db.collection("farmers").find({ farmerID }).toArray()

      products.push({
        id: String(product.id),
        title: product.title,
        description,
        ecoScore: {
          distance: parseFloat(12),
          ranking: parseFloat(88),
          co2: parseFloat(22.4)
        },
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

module.exports.getProducts = getProducts