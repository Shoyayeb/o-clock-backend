const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4f4qc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // connecting to mongodb
        await client.connect();
        const database = client.db("oclock");
        const productsCollection = database.collection("products");

        // get api to getting product
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find({});
            const product = await cursor.toArray();
            res.send(product);
        })
        // get api for getting single product
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });
        // post api for adding product
        app.post("/addproduct", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}

run().catch(console.dir)

app.get("/", (req, res) => {
    res.send("server running")
});
app.listen(port, () => {
    console.log('====================================');
    console.log("server running on ", port);
    console.log('====================================');
})