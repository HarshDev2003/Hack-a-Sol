import { GoogleGenerativeAI } from '@google/generative-ai';
import ApiError from '../../utils/ApiError.js';
import env from '../../config/env.js';

const DEFAULT_EMBEDDING_MODEL = 'models/text-embedding-004';

class GeminiService {
  constructor() {
    this.enabled = Boolean(env.gemini.apiKey);

    if (this.enabled) {
      this.client = new GoogleGenerativeAI(env.gemini.apiKey);
      this.model = this.client.getGenerativeModel({
        model: env.gemini.model
      });
      this.embeddingModel = this.client.getGenerativeModel({
        model: DEFAULT_EMBEDDING_MODEL
      });
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async summarize(text, metadata = {}) {
    if (!this.enabled) {
      throw new ApiError(500, 'Gemini API is not configured. Set GEMINI_API_KEY.');
    }

    const prompt = `You are an AI financial analyst. Summarize the following document in bullet points. 
Extract key monetary amounts, merchants, dates, categories, potential anomalies, and recommended actions.
Return JSON with shape:
{
  "summary": "text",
  "keyFacts": ["fact1", "fact2"],
  "recommendedActions": ["action1"],
  "category": "category name",
  "merchant": "merchant name",
  "amount": 0,
  "currency": "USD",
  "transactionDate": "YYYY-MM-DD"
}

Context metadata: ${JSON.stringify(metadata)}

Document text:
${text}`;

    const result = await this.model.generateContent(prompt);
    const output = result.response?.text();

    try {
      return JSON.parse(output);
    } catch {
      return {
        summary: output,
        keyFacts: [],
        recommendedActions: [],
        category: null,
        merchant: null,
        amount: null,
        currency: 'USD',
        transactionDate: null
      };
    }
  }

  async detectAnomalies(transactions = []) {
    if (!this.enabled) {
      throw new ApiError(500, 'Gemini API is not configured.');
    }

    if (!transactions.length) {
      return [];
    }

    const prompt = `You are an AI risk analyst. Given the following transactions in JSON, identify anomalies or fraud risks.
Return an array of objects: { "transactionId": "", "reason": "", "riskScore": 0-1, "recommendation": "" }
Transactions: ${JSON.stringify(transactions)}`;

    const result = await this.model.generateContent(prompt);
    const output = result.response?.text();

    try {
      return JSON.parse(output);
    } catch {
      return [];
    }
  }

  async embedText(text) {
    if (!this.enabled) {
      throw new ApiError(500, 'Gemini API is not configured.');
    }

    const result = await this.embeddingModel.embedContent(text);
    return result.embedding.values;
  }
}

export default GeminiService;

