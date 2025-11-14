import DocumentAIService from './documentAi.service.js';
import GeminiService from './gemini.service.js';
import RagService from './rag.service.js';

const documentAiService = new DocumentAIService();
const geminiService = new GeminiService();
const ragService = new RagService(geminiService);

export { documentAiService, geminiService, ragService };

