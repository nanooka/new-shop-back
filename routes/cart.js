const express = require("express");
const router = express();
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("../db");
const CartProduct = require("../models/cartProduct");

let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
  }
});

// http://localhost:3000/cart
// add product to cart
router.post("/", async (req, res) => {
  let {
    userId,
    id,
    image,
    title,
    price,
    rating,
    category,
    description,
    quantity,
  } = req.body;

  try {
    const existingCartItem = await db
      .collection("cart")
      .findOne({ userId, id });
    if (existingCartItem) {
      await db
        .collection("cart")
        .updateOne({ userId, id }, { $inc: { quantity: 1 } });
      res.status(200).json({ message: "Quantity updated successfully" });
    } else {
      const cartItem = new CartProduct(req.body);
      const result = await db.collection("cart").insertOne(cartItem);
      res.status(201).json(result);
      console.log(result);
    }
  } catch (err) {
    res.status(500).json({ error: "Could not add product" });
  }
});

// delect product from cart
router.delete("/:id", async (req, res) => {
  let {
    userId,
    id,
    image,
    title,
    price,
    rating,
    category,
    description,
    quantity,
  } = req.body;
  try {
    const existingCartItem = await db
      .collection("cart")
      .findOne({ userId, id });

    if (!existingCartItem) {
      return res.status(400).json({ message: "Product not found" });
    }

    if (existingCartItem.quantity > 1) {
      await db
        .collection("cart")
        .updateOne({ userId, id }, { $inc: { quantity: -1 } });
      return res.status(200).json({ message: "Quantity updated successfully" });
    }

    const result = await db.collection("cart").deleteOne({ userId, id });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not remove product from favorites" });
  }
  console.log(req.body);
});

module.exports = router;
