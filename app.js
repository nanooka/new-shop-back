const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

const app = express();
app.use(express.json());

// db connection
let db;

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("app listening on port 3000");
    });
    db = getDb();
  }
});

// routes

// get all users http://localhost:3000/users
app.get("/users", (req, res) => {
  let users = [];
  db.collection("users")
    .find()
    .sort({ email: 1 })
    .forEach((user) => users.push(user))
    .then(() => {
      res.status(200).json(users);
    })
    .catch(() => {
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

// get one user http://localhost:3000/users/65ff1ad87f480bfca93e826f
app.get("/users/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("users")
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not fetch the documents" });
      });
  } else {
    res.status(500).json({ error: "invalid id" });
  }
});

// add user
app.post("/users", (req, res) => {
  const user = req.body;
  db.collection("users")
    .insertOne(user)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not create a new document" });
    });
});

// delete user
app.delete("/users/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("users")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not delete the documents" });
      });
  } else {
    res.status(500).json({ error: "invalid id" });
  }
});

// update user info
app.patch("/users/:id", (req, res) => {
  const updates = req.body;

  if (ObjectId.isValid(req.params.id)) {
    db.collection("users")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not update the documents" });
      });
  } else {
    res.status(500).json({ error: "invalid id" });
  }
});
