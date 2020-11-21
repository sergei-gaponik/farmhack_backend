const Shopify = require("shopify-api-node")

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOPNAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_SECRET
})

const createOrder = async (req, res) => {

  try{

    const {
      username,
      items,
      paymentMethod
    } = req.body

    const products = await shopify.product.list()

    const body = {
      line_items: items.map(i => ({
        variant_id: products.find(p => p.id == i.id).variants[0].id,
        quantity: i.quantity
      })),
      email: username,
      "payment_gateway_names": [ paymentMethod ]
    }

    await shopify.order.create(body)

    console.log(body)

    res.json({ status: "success" })
  }
  catch(e){
    console.log(e)
    res.json({ status: "failure" })
  }
}

module.exports.createOrder = createOrder