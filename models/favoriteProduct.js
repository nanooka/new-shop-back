const mongoose = require("mongoose");

const favoriteProductSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    productId: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "favorites",
  }
);

module.exports = mongoose.model("FavoriteProduct", favoriteProductSchema);
