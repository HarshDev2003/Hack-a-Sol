import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { createAndProcessDocument, deleteDocument, listDocuments } from '../services/document.service.js';

export const getDocuments = asyncHandler(async (req, res) => {
  const documents = await listDocuments({
    ownerId: req.user._id,
    search: req.query.search
  });

  res.json({
    success: true,
    data: documents
  });
});

export const uploadDocument = asyncHandler(async (req, res) => {
  const document = await createAndProcessDocument({
    file: req.file,
    ownerId: req.user._id
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: document
  });
});

export const removeDocument = asyncHandler(async (req, res) => {
  await deleteDocument({ documentId: req.params.id, ownerId: req.user._id });

  res.status(httpStatus.NO_CONTENT).send();
});

