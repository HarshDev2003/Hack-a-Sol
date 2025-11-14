const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  vendor: String,
  date: String,
  total: Number,
  tax: Number,
  items: Array,
  payment_method: String,
  category: String,
  image_url: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
