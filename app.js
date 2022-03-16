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
        const orderedProductsCollection = database.collection("orders");
        const usersCollection = database.collection("users");

        // get api to getting product
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find({});
            const product = await cursor.toArray();
            res.send(product);
        })
        //get api for getting orders
        app.get("/orders", async (req, res) => {
            const cursor = orderedProductsCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })
        // get api for getting single product
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });
        // get api for getting users
        app.get("/users", async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });
        // get api for getting single user
        app.get("/users/:id", async (req, res) => {
            const email = req.params.id;
            console.log(email)
            const query = { email: (email) };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            let gotUser = {};
            if (user?.role === 'admin') {
                isAdmin = true,
                    gotUser = user;
            }
            res.json({ admin: isAdmin });
        });

        // post api for adding product
        app.post("/addproduct", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });
        // post api for buying
        app.post("/order", async (req, res) => {
            const product = req.body;
            const result = await orderedProductsCollection.insertOne(product);
            res.json(result);
        });

        // post api for adding users with email and password
        app.post("/adduser", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        // put api for adding user with social service login
        app.put('/adduser', async (req, res) => {
            const user = req.body;
            const filteredUsers = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filteredUsers, updateDoc, options);
            res.json(result);
        });
        // put api for adding admin with email and password
        app.put('/adduser/admin', async (req, res) => {
            const admin = req.body;
            const filteredUsers = { email: admin.email }
            // const options = { upsert: true };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filteredUsers, updateDoc);
            res.json(result);
        });
        // delete api for remove order
        app.delete('/removeorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderedProductsCollection.deleteOne(query);
            res.json(result);
        })
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