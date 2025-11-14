const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const receiptRoutes = require("./routes/receiptRoutes");

const app = express();
app.use("/api/receipt", receiptRoutes);

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


app.get("/", (req, res) => {
  res.send("Receipt AI Backend Running");
});

app.listen(5000, () => console.log("Server running on port 5000"));
