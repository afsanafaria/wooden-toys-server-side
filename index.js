const express = require('express');
require('dotenv').config()

const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1isfb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('piggyStore');
        const productCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');
        const userCollection = database.collection('users');



        //GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })


        //GET API BY ONE
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);

        })



        //POST API

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct)
            console.log('got new product', req.body);
            console.log('added a new product', result);
            res.json(result)
        })

        //DELETE API

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            console.log('deleting the products having this unique', result);
            res.json(result);
        })


        //post orders
        app.post('/orders', async (req, res) => {
            const newProduct = req.body;
            const result = await ordersCollection.insertOne(newProduct)
            console.log('got new product', req.body);
            console.log('added a new product', result);
            res.json(result)
        })
        //get orders api
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            console.log('got orders', orders)
            res.send(orders);
        })
        //GET API BY ONE
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            res.send(order);

        })

        //update status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: updatedUser.orderStatus,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            console.log("updated this order status", result);
            res.json(result)
        })

        //get order api buy query
        app.get('/oneUser', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email }
            }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            console.log("got one user", orders)
            res.json(orders);
        })

        //DELETE API

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log('deleting the order having this unique', result);
            res.json(result);
        })

        // post reviews
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview)
            console.log('got new review', req.body);
            console.log('added a new review', result);
            res.json(result)
        })

        //get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // post users
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser)
            console.log('got new user', req.body);
            console.log('added a new user', result);
            res.json(result)
        })

        //get users
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        //make admin 
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Piggy Piggy')
});

app.listen(port, () => {
    console.log("Choler choler", port);
})
