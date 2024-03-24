const express = require("express");
const users = require("./routes/users");

const app = express();
app.use(express.json());

app.use("/users", users);

app.listen(3000, () => {
  console.log("app listening on port 3000");
});
