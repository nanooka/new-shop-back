const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();

const users = require("./routes/users");
const favorites = require("./routes/favorites");
const cart = require("./routes/cart");

app.use(express.json());
app.use(cors());

app.use("/users", users);
app.use("/favorites", favorites);
app.use("/cart", cart);

app.listen(3000, () => {
  console.log("app listening on port 3000");
});
