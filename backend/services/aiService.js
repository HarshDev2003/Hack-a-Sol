const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const fs = require('fs');
const pdf = require('pdf-parse');

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract transaction data from text using Gemini AI (with retry logic)
 */
async function extractTransactionDataGemini(text, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
You are a financial document analyzer. Extract transaction information from the following text.

Text: "${text}"

Extract and return a JSON object with the following fields:
- merchant: The business or merchant name
- amount: The transaction amount (number only, no currency symbols)
- currency: The currency code (e.g., INR, USD, EUR, default to INR if not found)
- category: The transaction category (e.g., Groceries, Shopping, Food, Gas, Utilities, Transport, Entertainment, Healthcare, Other)
- date: The transaction date in ISO format (YYYY-MM-DD)
- description: A brief description of the transaction

If any field cannot be determined, use null.

Return ONLY valid JSON, no additional text.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const data = JSON.parse(jsonMatch[0]);
      
      // Validate and clean data
      return {
        merchant: data.merchant || 'Unknown Merchant',
        amount: parseFloat(data.amount) || 0,
        currency: data.currency || 'INR',
        category: data.category || 'Other',
        transactionDate: data.date ? new Date(data.date) : new Date(),
        description: data.description || ''
      };
    } catch (error) {
      console.error(`Gemini extraction error (attempt ${attempt}/${retries}):`, error.message);
      
      // If model is overloaded and we have retries left, wait and retry
      if ((error.message.includes('overloaded') || error.message.includes('503')) && attempt < retries) {
        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying extraction in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw error;
    }
  }
}

/**
 * Extract transaction data from text using OpenAI GPT-4
 */
async function extractTransactionDataOpenAI(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a financial document analyzer. Extract transaction information and return only valid JSON.'
        },
        {
          role: 'user',
          content: `Extract transaction information from this text and return a JSON object with fields: merchant, amount (number), currency, category (Groceries/Shopping/Food/Gas/Utilities/Transport/Entertainment/Healthcare/Other), date (YYYY-MM-DD), description.

Text: "${text}"

Return ONLY valid JSON.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const data = JSON.parse(jsonMatch[0]);
    
    // Validate and clean data
    return {
      merchant: data.merchant || 'Unknown Merchant',
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'INR',
      category: data.category || 'Other',
      transactionDate: data.date ? new Date(data.date) : new Date(),
      description: data.description || ''
    };
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw error;
  }
}

/**
 * Extract text from image using Gemini 2.5 Flash (with retry logic)
 */
async function extractTextFromImage(imagePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use gemini-2.5-flash which is confirmed working
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Read image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Determine mime type from file extension
      const ext = imagePath.toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext.endsWith('.png')) mimeType = 'image/png';
      else if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (ext.endsWith('.webp')) mimeType = 'image/webp';

      const prompt = `Extract all text from this receipt or invoice image. Include merchant name, amount, date, and any other transaction details. Return all the text you can see.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Gemini image extraction error (attempt ${attempt}/${retries}):`, error.message);
      
      // If model is overloaded and we have retries left, wait and retry
      if (error.message.includes('overloaded') && attempt < retries) {
        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If all retries failed, throw error
      throw new Error('Failed to extract text from image after multiple attempts');
    }
  }
}

// OpenAI fallback removed - quota exceeded

/**
 * Extract text from PDF using pdf-parse
 */
async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Use pdf-parse default function
    const data = await pdf(dataBuffer);
    
    if (!data || !data.text) {
      throw new Error('No text extracted from PDF');
    }
    
    return data.text;
  } catch (error) {
    console.error('PDF text extraction error:', error.message);
    // If PDF parsing fails, return empty string to let image OCR handle it
    return '';
  }
}

/**
 * Process document and extract transaction data
 */
async function processDocument(filePath, mimeType, useAI = 'gemini') {
  try {
    let extractedText = '';

    // Extract text based on file type
    if (mimeType.includes('pdf')) {
      extractedText = await extractTextFromPDF(filePath);
    } else if (mimeType.includes('image')) {
      extractedText = await extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file type');
    }

    // Clean and prepare text
    extractedText = extractedText.trim();

    if (!extractedText || extractedText.length < 10) {
      throw new Error('No readable text found in document');
    }

    // Extract transaction data using AI
    let transactionData;
    if (useAI === 'openai') {
      transactionData = await extractTransactionDataOpenAI(extractedText);
    } else {
      transactionData = await extractTransactionDataGemini(extractedText);
    }

    return {
      ...transactionData,
      extractedText,
      aiProvider: useAI
    };
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
}

/**
 * Detect anomalies in transaction using AI (with retry logic)
 */
async function detectAnomalies(transaction, userTransactionHistory, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare transaction history summary
    const avgAmount = userTransactionHistory.length > 0
      ? userTransactionHistory.reduce((sum, t) => sum + t.amount, 0) / userTransactionHistory.length
      : 0;

    const categoryTransactions = userTransactionHistory.filter(
      t => t.category === transaction.category
    );
    const avgCategoryAmount = categoryTransactions.length > 0
      ? categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length
      : 0;

    const prompt = `
Analyze this transaction for anomalies based on user's spending pattern.

Current Transaction:
- Merchant: ${transaction.merchant}
- Amount: ${transaction.amount}
- Category: ${transaction.category}
- Date: ${transaction.date}

User's Spending Pattern:
- Average transaction amount: ${avgAmount.toFixed(2)}
- Average amount in ${transaction.category}: ${avgCategoryAmount.toFixed(2)}
- Total transactions: ${userTransactionHistory.length}

Analyze and return a JSON object with:
- isAnomaly: boolean (true if suspicious)
- riskScore: number (0-1, where 1 is highest risk)
- reason: string (brief explanation)
- recommendation: string (what user should do)

Return ONLY valid JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`Anomaly detection error (attempt ${attempt}/${retries}):`, error.message);
      
      // If model is overloaded and we have retries left, wait and retry
      if ((error.message.includes('overloaded') || error.message.includes('503')) && attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`Retrying anomaly detection in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return null;
    }
  }
}

/**
 * Generate financial insights using AI (with retry logic)
 */
async function generateFinancialInsights(transactions, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare transaction summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)}`)
      .join(', ');

    const prompt = `
As a financial advisor, provide insights and recommendations based on this spending data.

Summary:
- Total Income: ₹${totalIncome.toFixed(2)}
- Total Expenses: ₹${totalExpenses.toFixed(2)}
- Net: ₹${(totalIncome - totalExpenses).toFixed(2)}
- Top spending categories: ${topCategories}
- Number of transactions: ${transactions.length}

Provide 3-5 actionable insights and recommendations to improve financial health.
Return a JSON array of strings, each being one insight.

Return ONLY valid JSON array.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return [];
    }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`Insights generation error (attempt ${attempt}/${retries}):`, error.message);
      
      // If model is overloaded and we have retries left, wait and retry
      if ((error.message.includes('overloaded') || error.message.includes('503')) && attempt < retries) {
        const waitTime = attempt * 2000;
        console.log(`Retrying insights generation in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return [];
    }
  }
}

module.exports = {
  processDocument,
  detectAnomalies,
  generateFinancialInsights,
  extractTransactionDataGemini,
  extractTransactionDataOpenAI
};
