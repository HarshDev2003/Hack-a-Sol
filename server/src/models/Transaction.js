import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    merchant: String,
    category: String,
    type: {
      type: String,
      enum: ['income', 'expense'],
      default: 'expense'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    date: {
      type: Date,
      default: Date.now
    },
    tags: [String],
    notes: String,
    aiConfidence: Number,
    anomalyScore: Number
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

