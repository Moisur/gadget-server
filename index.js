const express = require('express')
const app = express()
const port = process.env.PORT || 5000

const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');


/* =======================  middleware ================== */
app.use(cors())
app.use(express.json())
/*  ===================== server works  ====================  */

/* ================== mongodb ==========================  */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b56vy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect()
    const collection = client.db("Gadget").collection("product");
    const OrderCollection = client.db("Gadget").collection("order");
    /* =============== login get ========================  */
    // http://localhost:5000/login
    app.post('/login', async (req, res) => {
      const data = req.body
      const token = jwt.sign(data, process.env.JWT_JSON_WEB_TOKEN);
      res.send({ token })
    })
    /* =================== product update  ============= */
    app.post('/products', async (req, res) => {
      const data = req.body
      console.log(data)
      const token = req.headers.authorization
      const [email, Authorization] = token.split(' ')
      const decoded = verifyToken(Authorization)
      if (decoded.email === email) {
        console.log('Sbumit data ')
         await collection.insertOne(data);
        res.send({ success: "Success Authorization" })
      }
      else{
        res.send({ success: "unSuccess Authorization" })
      }
      
    })
/* ============================ product   ==============*/
    /* http://localhost:5000/products */
    app.get('/products',async(req,res)=>{
      const query = {};
      const product = collection.find(query);
      const result = await product.toArray();
      res.send(result)
    })
/* order post  */
    app.post('/orders',async(req,res)=>{
      const data =req.body
      const result = await OrderCollection.insertOne(data);
      res.send(result)
    })
    /*  order get  */
    app.get('/orders',async(req,res)=>{
      const user = req.headers.authorization
      const query = {email:user};
      const order = OrderCollection.find(query)
      const result = await order.toArray()
      res.send(result)
    })
  
  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/home', (req, res) => {
  res.send('This is home pages ')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const verifyToken = (Authorization) => {
  let email;
  jwt.verify(Authorization, process.env.JWT_JSON_WEB_TOKEN, function (err, decoded) {
    if (err) {
      email = "invalid token"
    }
    if (decoded) {
      email = decoded
    }
  });
  return email;
}