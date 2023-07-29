const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p1lnucg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// ------------
async function run() {
    try {
        //    ---- create connection---
        await client.connect();

        const database = client.db("AvengersAssemble");
        const usersCollection = database.collection("toyTable");

        // -------add user to database start---------

        app.post("/addToy", async (req, res) => {
            const user = req.body;
            console.log("new user", user);

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // -------add user to database finish---------

        // -------read data from databse start-------

        app.get("/allToys", async (req, res) => {
            const cursor = usersCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });
        // -------read data from databse finish-------

        // read single data
        app.get("/allToys/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        //---------- load specific user data start---------

        app.get("/myToys", async (req, res) => {
            let query = {};

            if (req.query?.email) {
                query = { email: req.query.email };
            }
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        });

        //---------- load specific user data finish---------

        // --------delete from database start----------

        app.delete("/allToys/:id", async (req, res) => {
            const id = req.params.id;
            console.log("delete this id= ", id);
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        // --------delete from database finish----------

        // -------update data from database start---------

        // get the single information we want to update
        // app.get("/allToys/:id", async (req, res) => {
        //     const id = req.params.id;

        //     const query = { _id: new ObjectId(id) };
        //     const user = await usersCollection.findOne(query);
        //     res.send(user);
        // });

        // ----main update function start here

        app.put("/allToys/:id", async (req, res) => {
            const id = req.params.id;
            const user = req.body; // the data whcih are send from client site are stored in this body means  user

            // console.log(id, updatedUser);

            // update in mongoDB
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const updatedUser = {
                $set: {
                    quantity: user.quantity,
                    price: user.price,
                    details: user.details,
                },
            };
            const result = await usersCollection.updateOne(
                filter,
                updatedUser,
                options
            );
            res.send(result);
        });
        // -------update data from database finish---------


        // ------- search text

          const indexKeys = { id: 1, name: 1 };
          const indexOptions = { name: "toyName" };
          const result = await usersCollection.createIndex(indexKeys, indexOptions);

         app.get("/searchToy/:text", async (req, res) => {
             const searchText = req.params.text;
             const result = await usersCollection
                 .find({
                     $or: [
                         { name: { $regex: searchText, $options: "i" } },
                         { id: { $regex: searchText, $options: "i" } },
                     ],
                 })
                 .toArray();
             res.send(result);
         });
      

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// ------------

app.get("/", (req, res) => {
    res.send("mongodb is running...");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});


// https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZB2toDnk4GcKhLkBEjNtKtF44774EFFuceQ&usqp=CAU