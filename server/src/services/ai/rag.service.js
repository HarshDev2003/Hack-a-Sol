import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import env from '../../config/env.js';
import logger from '../../config/logger.js';

class RagService {
  constructor(geminiService) {
    this.enabled = Boolean(env.pinecone.apiKey) && Boolean(env.pinecone.index);
    this.gemini = geminiService;

    if (this.enabled) {
      this.client = new Pinecone({
        apiKey: env.pinecone.apiKey
      });
      this.index = this.client.Index(env.pinecone.index);
    }

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 80
    });
  }

  isEnabled() {
    return this.enabled && this.gemini?.isEnabled();
  }

  async upsertDocument({ id, text, metadata }) {
    if (!this.isEnabled() || !text) {
      return;
    }

    const chunks = await this.splitter.splitText(text);
    const vectors = [];

    for (let idx = 0; idx < chunks.length; idx += 1) {
      const chunk = chunks[idx];
      const embedding = await this.gemini.embedText(chunk);
      vectors.push({
        id: `${id}-${idx}`,
        values: embedding,
        metadata: {
          ...metadata,
          chunk
        }
      });
    }

    await this.index.upsert(vectors, { namespace: env.pinecone.namespace });
    logger.debug({ vectors: vectors.length }, 'Pinecone upsert complete');
  }

  async searchSimilar(query, topK = 5) {
    if (!this.isEnabled()) {
      return [];
    }

    const embedding = await this.gemini.embedText(query);
    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      namespace: env.pinecone.namespace
    });

    return results.matches || [];
  }
}

export default RagService;

