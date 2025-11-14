import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    mimeType: String,
    size: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'processed', 'failed'],
      default: 'pending'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    merchant: String,
    category: String,
    transactionDate: Date,
    summary: String,
    aiConfidence: Number,
    extractedFields: mongoose.Schema.Types.Mixed,
    rawText: String,
    pineconeId: String,
    error: String
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;

