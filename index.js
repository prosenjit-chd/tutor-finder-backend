const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocrjv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('yooda-hostel');
        const studentsCollection = database.collection('students');
        const foodsCollection = database.collection('foods');
        const distributionCollection = database.collection('distribution');

        /* -------Student------ */
        // GET API
        app.get('/students', async (req, res) => {
            const cursor = studentsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let students = [];
            const count = await cursor.count();
            if (page) {
                students = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                students = await cursor.toArray();
            }
            res.send({
                count,
                students: students
            });
        })
        // POST API
        app.post('/students', async (req, res) => {
            const newStudent = req.body;
            const result = await studentsCollection.insertOne(newStudent);
            res.json(result);
        })

        app.get('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tutor = await studentsCollection.findOne(query);
            res.send(tutor);
        })


        // DELETE ORDER API
        app.delete('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentsCollection.deleteOne(query);
            res.json(result);
        })

        // UPDATE ORDER API
        app.put('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const updateTutor = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateTutor.status
                },
            }
            const result = await studentsCollection.updateOne(filter, updateDoc, options);
            // console.log(result);
            res.json(result);
        })

        /* -------Order------ */
        // POST ORDER API
        app.post('/foods', async (req, res) => {
            const newFood = req.body;
            const result = await foodsCollection.insertOne(newFood);
            res.json(result);
        })

        // GET API
        app.get('/foods', async (req, res) => {
            const cursor = foodsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let foods = [];
            const count = await cursor.count();
            if (page) {
                foods = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                foods = await cursor.toArray();
            }
            res.send({
                count,
                foods: foods
            });
        })


        // DELETE ORDER API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await foodsCollection.deleteOne(query);
            res.json(result);
        })

        // UPDATE ORDER API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                },
            }
            const result = await foodsCollection.updateOne(filter, updateDoc, options);
            // console.log(result);
            res.json(result);
        })

        // /* -------Review------ */
        // // Review get api
        // app.get('/reviews', async (req, res) => {
        //     const cursor = reviewsCollection.find({});
        //     reviews = await cursor.toArray();
        //     res.json(reviews);
        // })

        // // Review post api
        // app.post('/reviews', async (req, res) => {
        //     const newReview = req.body;
        //     const result = await reviewsCollection.insertOne(newReview);
        //     res.json(result);
        // })

        /* -------User------ */
        // GET User API
        app.get('/users', async (req, res) => {
            const cursor = distributionCollection.find({});
            users = await cursor.toArray();
            res.send(users);
        })

        // user get api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await distributionCollection.findOne(query);
            let isAdmin = false;
            let isTeacher = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            if (user?.role === 'teacher') {
                isTeacher = true;
            }
            res.json({ admin: isAdmin, teacher: isTeacher });
        });

        // user Post Api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await distributionCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        // user Put Api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await distributionCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // User Admin Put Api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await distributionCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // User Teacher Put Api
        app.put('/users/teacher', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'teacher' } };
            const result = await distributionCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('This is home');
});

app.get('/test', (req, res) => {
    res.send('This is test');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})