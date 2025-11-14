const express = require("express");
const { upload } = require("../middleware/upload");
const { uploadReceipt, getAllTransactions } = require("../controllers/receiptController");

const router = express.Router();

router.post("/upload", upload.single("receipt"), uploadReceipt);

router.get("/all", getAllTransactions);

module.exports = router;
