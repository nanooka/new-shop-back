const express = require("express");
const router = express();
const { connectToDb, getDb } = require("../db");
const FavoriteProduct = require("../models/favoriteProduct");

let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
  }
});

// http://localhost:3000/favorites
// add product to favorites
router.post("/", async (req, res) => {
  const { userId, id, image, title, price, rating, category, description } =
    req.body;
  try {
    const existingFavorite = await db
      .collection("favorites")
      .findOne({ userId, id });

    if (existingFavorite) {
      return res
        .status(400)
        .json({ error: "Product already exist in favorites" });
    }

    const favorite = new FavoriteProduct(req.body);
    const result = await db.collection("favorites").insertOne(favorite);
    res.status(201).json(result);
    console.log(result);
  } catch (err) {
    res.status(500).json({ error: "Could not add product" });
  }
});

// delete product from favorites
router.delete("/:id", async (req, res) => {
  try {
    const existingFavorite = await db.collection("favorites").findOne(req.body);
    console.log(existingFavorite);
    if (!existingFavorite) {
      return res.status(400).json({ message: "Product not found" });
    }

    const result = await db.collection("favorites").deleteOne(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not remove product from favorites" });
  }
});

// get user's favorite list
router.post("/userfavorites", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const userFavorites = await db
      .collection("favorites")
      .find({ userId })
      .toArray();
    res.status(200).json(userFavorites);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Could not get favorites" });
  }
});

module.exports = router;
