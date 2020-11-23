const Shopify = require("shopify-api-node")

const fetch = require("node-fetch")

const shopify = new Shopify({
  shopName: process.env.SHOPIFY_SHOPNAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_API_SECRET
})

const createOrder = async (req, res) => {

  try{

    const db = process.mongoClient.db

    const { items } = JSON.parse(req.body)

    const username = req.custom.username

    const products = await shopify.product.list()

    const [{ address }] = await db.collection("accounts").find({ username }).toArray()

    const body = {
      order: {
        line_items: items.map(i => ({
          variant_id: products.find(p => p.id == i.id).variants[0].id,
          quantity: i.quantity
        })),
        email: username,
        shipping_address: {
          address1: address
        }
      }
    }

    const key = process.env.SHOPIFY_API_KEY
    const secret = process.env.SHOPIFY_API_SECRET

    const url = `https://${key}:${secret}@bauernebenan14.myshopify.com/admin/api/2020-10/orders.json`

    const response = await fetch(url, { 
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()

    console.log({data})
    
    if(data.errors){
      res.json({ status: "failure" })
      return;
    }

    res.json({ status: "success" })
  }
  catch(e){
    console.log(e)
    res.json({ status: "failure" })
  }
}

module.exports.test = () => {

  createOrder({body: JSON.stringify({
      "items": [
        {
          id: "6095532327094",
          quantity: 1
        }
      ]
  })}, {})

}

module.exports.createOrder = createOrder

