import fs from 'fs/promises';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import env from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

class DocumentAIService {
  constructor() {
    this.enabled =
      Boolean(env.google.projectId) &&
      Boolean(env.google.documentAi?.processorId) &&
      Boolean(env.google.documentAi?.location);

    if (this.enabled) {
      this.client = new DocumentProcessorServiceClient({
        projectId: env.google.projectId,
        keyFilename: env.google.credentialsPath
      });
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async processDocument(filePath, mimeType) {
    if (!this.enabled) {
      throw new ApiError(500, 'Google Document AI is not configured. Please set GOOGLE_* env vars.');
    }

    const name = this.client.processorPath(
      env.google.projectId,
      env.google.documentAi.location,
      env.google.documentAi.processorId
    );

    const fileBuffer = await fs.readFile(filePath);

    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType
      }
    };

    const [response] = await this.client.processDocument(request);
    const doc = response.document;

    const fields = (doc.entities || []).reduce((acc, entity) => {
      if (entity.type) {
        acc[entity.type] = {
          value: entity.mentionText,
          confidence: entity.confidence
        };
      }
      return acc;
    }, {});

    return {
      text: doc.text || '',
      fields,
      confidence: doc.confidence || null
    };
  }
}

export default DocumentAIService;

