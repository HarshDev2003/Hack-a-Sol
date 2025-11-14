const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const pdf = require('pdf-parse');

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------------------------------------------------
   1. Extract TEXT from IMAGE using GEMINI Vision OCR
-----------------------------------------------------*/
async function extractTextFromImage(filePath) {
  try {
    console.log("🔥 Gemini Vision OCR →", filePath);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const imgBuffer = fs.readFileSync(filePath);

    const prompt = `
Extract ALL readable text from this receipt or invoice image.
Return ONLY plain text. No explanation.
`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: imgBuffer.toString("base64"),
          mimeType: "image/jpeg"
        }
      }
    ]);

    return result.response.text().trim();

  } catch (err) {
    console.error("❌ Gemini OCR Failed:", err);
    throw new Error("Failed to extract text from image");
  }
}

/* ---------------------------------------------------
   2. Extract text from PDF using pdf-parse
-----------------------------------------------------*/
async function extractTextFromPDF(pdfPath) {
  try {
    console.log("📄 Extracting text from PDF using pdf-parse…");

    const buffer = fs.readFileSync(pdfPath);
    const data = await pdf(buffer);

    if (!data.text || data.text.length < 10) {
      throw new Error("PDF contains no readable text. Try uploading an image of the receipt instead.");
    }

    return data.text.trim();
    
  } catch (err) {
    console.error("❌ PDF extraction failed:", err.message);
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}

/* ---------------------------------------------------
   4. Extract Structured Transaction Data using Gemini
-----------------------------------------------------*/
async function extractTransactionDataGemini(text) {
  try {
    console.log("🤖 Extracting transaction data from text…");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Extract structured transaction data from the text.

Fields:
- merchant
- amount (number only)
- currency
- category
- date (YYYY-MM-DD)
- description

Text:
"${text}"

Return ONLY valid JSON.
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON not found");

    const data = JSON.parse(jsonMatch[0]);

    return {
      merchant: data.merchant || "Unknown",
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || "INR",
      category: data.category || "Other",
      transactionDate: data.date ? new Date(data.date) : new Date(),
      description: data.description || ""
    };

  } catch (err) {
    console.error("❌ Transaction Extraction Error:", err);
    throw err;
  }
}

/* ---------------------------------------------------
   3. MAIN FUNCTION — Process Document
-----------------------------------------------------*/
async function processDocument(filePath, mimeType) {
  try {
    let extractedText = "";
    filePath = filePath.replace(/\\/g, "/");

    console.log("\n📄 Processing file:", filePath);
    console.log("Mime:", mimeType);

    /* ---------- PDF HANDLING ---------- */
    if (mimeType.includes("pdf")) {
      console.log("Processing PDF file...");
      extractedText = await extractTextFromPDF(filePath);
    }

    /* ---------- IMAGE HANDLING ---------- */
    else if (mimeType.includes("image")) {
      console.log("Processing image file...");
      extractedText = await extractTextFromImage(filePath);
    }

    else {
      throw new Error("Unsupported file type");
    }

    if (!extractedText || extractedText.length < 10) {
      throw new Error("No readable text found in document. Please ensure the document is clear and readable.");
    }

    console.log("✅ Text extracted, length:", extractedText.length);
    const transaction = await extractTransactionDataGemini(extractedText);

    return {
      ...transaction,
      extractedText,
      aiProvider: "gemini"
    };

  } catch (err) {
    console.error("❌ Process Document Error:", err.message);
    throw err;
  }
}

/* ---------------------------------------------------
   6. Anomaly Detection (Gemini)
-----------------------------------------------------*/
async function detectAnomalies(transaction, history) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const avg = history.length
      ? history.reduce((s, t) => s + t.amount, 0) / history.length
      : 0;

    const prompt = `
Analyze if this transaction is unusual.

Transaction:
${JSON.stringify(transaction)}

User average spend: ${avg}

Return JSON:
{
  "isAnomaly": boolean,
  "riskScore": number,
  "reason": "",
  "recommendation": ""
}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  } catch (err) {
    console.error("❌ Anomaly detection failed:", err);
    return null;
  }
}

module.exports = {
  processDocument,
  detectAnomalies
};
