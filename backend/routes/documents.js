const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Transaction = require('../models/Transaction');
const Anomaly = require('../models/Anomaly');
const { auth } = require('../middleware/auth');
const { processDocument, detectAnomalies } = require('../services/aiService');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

// Get all documents for current user
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = { user: req.userId };

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload document with AI processing
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create document record
    const document = new Document({
      user: req.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'processing'
    });

    await document.save();

    // Process document with AI in background
    processDocumentWithAI(document, req.userId).catch(err => {
      console.error('Background AI processing error:', err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully. AI processing started.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Background AI processing function
async function processDocumentWithAI(document, userId) {
  try {
    // Determine AI provider (use Gemini by default, fallback to OpenAI)
    const aiProvider = process.env.GEMINI_API_KEY ? 'gemini' : 'openai';

    // Process document with AI
    const extractedData = await processDocument(
      document.filePath,
      document.mimeType,
      aiProvider
    );

    // Update document with extracted data
    document.merchant = extractedData.merchant;
    document.category = extractedData.category;
    document.amount = extractedData.amount;
    document.currency = extractedData.currency;
    document.transactionDate = extractedData.transactionDate;
    document.extractedData = {
      text: extractedData.extractedText,
      aiProvider: extractedData.aiProvider,
      description: extractedData.description
    };
    document.status = 'processed';
    await document.save();

    // Create transaction from extracted data
    const transaction = new Transaction({
      user: userId,
      merchant: extractedData.merchant,
      amount: extractedData.amount,
      currency: extractedData.currency,
      category: extractedData.category,
      type: 'expense', // Default to expense, can be updated later
      date: extractedData.transactionDate,
      description: extractedData.description,
      document: document._id,
      status: 'completed'
    });

    await transaction.save();

    // Get user's transaction history for anomaly detection
    const userTransactions = await Transaction.find({ user: userId }).limit(100);

    // Detect anomalies
    const anomalyResult = await detectAnomalies(transaction, userTransactions);

    if (anomalyResult && anomalyResult.isAnomaly) {
      // Create anomaly record
      const anomaly = new Anomaly({
        user: userId,
        transaction: transaction._id,
        type: 'unusual_amount',
        severity: anomalyResult.riskScore > 0.7 ? 'high' : anomalyResult.riskScore > 0.4 ? 'medium' : 'low',
        description: anomalyResult.reason,
        status: 'new',
        metadata: {
          riskScore: anomalyResult.riskScore,
          recommendation: anomalyResult.recommendation,
          aiProvider
        }
      });

      await anomaly.save();
    }

    console.log(`Document ${document._id} processed successfully with ${aiProvider}`);
  } catch (error) {
    console.error('AI processing failed:', error);
    document.status = 'failed';
    document.extractedData = { error: error.message };
    await document.save();
  }
}

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
