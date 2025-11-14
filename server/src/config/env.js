import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../.env')
});

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .default('5000'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  GOOGLE_PROJECT_ID: z.string().optional(),
  DOCUMENT_AI_LOCATION: z.string().optional(),
  DOCUMENT_AI_PROCESSOR_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('models/gemini-1.5-pro-latest'),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
  PINECONE_NAMESPACE: z.string().default('lumen-documents'),
  UPLOADS_DIR: z.string().default('uploads')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. Check your .env file.');
}

const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: Number(parsed.data.PORT),
  clientUrl: parsed.data.CLIENT_URL,
  mongoUri: parsed.data.MONGODB_URI,
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN
  },
  google: {
    projectId: parsed.data.GOOGLE_PROJECT_ID,
    documentAi: {
      location: parsed.data.DOCUMENT_AI_LOCATION,
      processorId: parsed.data.DOCUMENT_AI_PROCESSOR_ID
    },
    credentialsPath: parsed.data.GOOGLE_APPLICATION_CREDENTIALS
  },
  gemini: {
    apiKey: parsed.data.GEMINI_API_KEY,
    model: parsed.data.GEMINI_MODEL
  },
  pinecone: {
    apiKey: parsed.data.PINECONE_API_KEY,
    index: parsed.data.PINECONE_INDEX,
    namespace: parsed.data.PINECONE_NAMESPACE
  },
  storage: {
    uploadsDir: path.resolve(process.cwd(), parsed.data.UPLOADS_DIR)
  }
};

export default env;

