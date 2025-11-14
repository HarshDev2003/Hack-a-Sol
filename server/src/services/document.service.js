import fs from 'fs/promises';
import path from 'path';
import Document from '../models/Document.js';
import Transaction from '../models/Transaction.js';
import { documentAiService, geminiService, ragService } from './ai/index.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

const inferAmount = (fields = {}, fallback) => {
  const aiAmount = fields.amount?.value || fields.total_amount?.value;
  return aiAmount ? Number(aiAmount) : fallback;
};

const inferDate = (fields = {}, fallback) => {
  const fieldValue = fields.date?.value || fields.transaction_date?.value;
  return fieldValue ? new Date(fieldValue) : fallback;
};

export const storeDocument = async ({ file, ownerId }) => {
  if (!file) {
    throw new ApiError(400, 'File is required');
  }

  await fs.mkdir(env.storage.uploadsDir, { recursive: true });

  const fileName = `${Date.now()}-${file.originalname}`;
  const destination = path.join(env.storage.uploadsDir, fileName);

  await fs.writeFile(destination, file.buffer);

  const document = await Document.create({
    owner: ownerId,
    originalName: file.originalname,
    filePath: destination,
    mimeType: file.mimetype,
    size: file.size,
    status: 'processing'
  });

  return document;
};

export const processDocument = async (document) => {
  const aiExtraction = await documentAiService.processDocument(document.filePath, document.mimeType);
  const geminiSummary = await geminiService.summarize(aiExtraction.text, {
    fileName: document.originalName
  });

  const amount = inferAmount(aiExtraction.fields, geminiSummary.amount);
  const transactionDate = inferDate(aiExtraction.fields, geminiSummary.transactionDate ? new Date(geminiSummary.transactionDate) : undefined);

  document.status = 'processed';
  document.summary = geminiSummary.summary;
  document.merchant = geminiSummary.merchant || aiExtraction.fields?.merchant?.value;
  document.category = geminiSummary.category || aiExtraction.fields?.category?.value;
  document.amount = amount || null;
  document.currency = geminiSummary.currency || 'USD';
  document.transactionDate = transactionDate || new Date();
  document.extractedFields = aiExtraction.fields;
  document.rawText = aiExtraction.text;
  document.aiConfidence = aiExtraction.confidence;

  await document.save();

  if (document.amount) {
    await Transaction.create({
      owner: document.owner,
      document: document._id,
      merchant: document.merchant,
      category: document.category,
      amount: document.amount,
      currency: document.currency,
      date: document.transactionDate,
      aiConfidence: document.aiConfidence
    });
  }

  await ragService.upsertDocument({
    id: document._id.toString(),
    text: aiExtraction.text,
    metadata: {
      documentId: document._id.toString(),
      ownerId: document.owner.toString(),
      merchant: document.merchant,
      category: document.category
    }
  });

  return document;
};

export const createAndProcessDocument = async ({ file, ownerId }) => {
  const document = await storeDocument({ file, ownerId });
  try {
    const processed = await processDocument(document);
    return processed;
  } catch (error) {
    document.status = 'failed';
    document.error = error.message;
    await document.save();
    throw error;
  }
};

export const listDocuments = async ({ ownerId, search }) => {
  const query = { owner: ownerId };
  if (search) {
    query.$or = [
      { originalName: { $regex: search, $options: 'i' } },
      { merchant: { $regex: search, $options: 'i' } }
    ];
  }

  return Document.find(query).sort({ createdAt: -1 });
};

export const deleteDocument = async ({ documentId, ownerId }) => {
  const document = await Document.findOne({ _id: documentId, owner: ownerId });
  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  await fs.unlink(document.filePath).catch(() => {});
  await Document.deleteOne({ _id: documentId });
  await Transaction.deleteMany({ document: documentId });
};

