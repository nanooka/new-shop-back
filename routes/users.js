const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express();
// router.use(express.json());

// router.use(express.urlencoded({ extended: true }));

// const bodyParser = require("body-parser");
// router.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
  }
});

// routes

// get all users http://localhost:3000/users
router.get("/", (req, res) => {
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
router.get("/:id", (req, res) => {
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

// sign up user
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User is already registered with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    const result = await db.collection("users").insertOne(user);

    res.status(201).json(result);
    console.log(result, user);
  } catch (err) {
    res.status(500).json({ error: "Could not create a new document" });
  }
});

// log in user http:localhost:3000/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.MY_SECRET, {
      expiresIn: "1h",
    });

    const userID = user._id;
    console.log(userID, token);
    res.status(200).json({ userID, token });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// delete user
router.delete("/:id", (req, res) => {
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
router.patch("/:id", (req, res) => {
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

module.exports = router;
