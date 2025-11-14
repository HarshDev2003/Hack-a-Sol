const Transaction = require("../models/Transaction");
const { geminiOCR } = require("../utils/gemini");

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Send 'receipt' file." });
    }

    console.log("File received:", req.file.originalname);

    const extractedJSON = await geminiOCR(req.file.buffer);

    let data;
    try {
      data = JSON.parse(extractedJSON);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON returned from Gemini OCR" });
    }

    const newTransaction = await Transaction.create({
      vendor: data.vendor,
      date: data.date,
      total: data.total,
      tax: data.tax,
      items: data.items,
      payment_method: data.payment_method,
      category: data.category,
      image_url: "",
    });

    res.json({
      message: "Receipt processed successfully!",
      transaction: newTransaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error processing receipt" });
  }
};

const getAllTransactions = async (req, res) => {
  const tx = await Transaction.find().sort({ created_at: -1 });
  res.json(tx);
};

module.exports = { uploadReceipt, getAllTransactions };
