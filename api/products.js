const Shopify = require("shopify-api-node")
const geo = require("../geo/geo")

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOPNAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_SECRET
})

const getProducts = async (req, res) => {

  let products = []

  const allProducts = await shopify.product.list()

  for(const product of allProducts){

    const { hubID } = JSON.parse(product.description)
    const distance = await geo.getDistanceFromHub(hubID, req.custom.username)

    if(distance < process.global.maxDistanceFromHub){

      products.push(product)
    }

  }

  products.map(p => {

      const { description, farmerDetails, unit } = JSON.parse(p.description)

      return {
        id: p.id,
        title: p.title,
        description,
        ecoScore: {
          distance: 12,
          ranking: 88,
          co2: 22.4
        },
        price: p.price,
        quantity: p.variants[0].quantity,
        unit,
        farmerDetails
      }
    })

  res.json({ products })
}

module.exports.getProducts = getProducts