const express = require("express");
const router = express();
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

    const result = await db.collection("cart").deleteOne({ userId, id });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not remove product from favorites" });
  }
  console.log(req.body);
});

router.patch("/:id", async (req, res) => {
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
    if (existingCartItem.quantity == 1) {
      const result = await db.collection("cart").deleteOne({ userId, id });
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ error: "Could not remove product from favorites" });
  }
});

// get user's cart product list
router.post("/userCart", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const userCart = await db.collection("cart").find({ userId }).toArray();
    res.status(200).json(userCart);
  } catch (err) {
    res.status(500).json({ error: "Could not get cart" });
  }
});

module.exports = router;
