const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("JSON not found in Gemini response");
  }

  return text.substring(start, end + 1);
}

async function geminiOCR(buffer) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are a receipt parser. 
Extract ONLY the following fields and return ONLY valid JSON:
{
  "vendor": string,
  "date": string,
  "total": number,
  "tax": number,
  "items": [
    {
      "name": string,
      "qty": number,
      "price": number
    }
  ],
  "payment_method": string,
  "category": string
}

RULES:
- Output ONLY JSON.
- NO markdown.
- NO explanation.
- NO code blocks.
- If a field is missing, return null or [].
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: buffer.toString("base64")
        }
      }
    ]);

    const raw = result.response.text();
    const jsonString = extractJSON(raw);

    return jsonString;

  } catch (err) {
    console.error("Gemini OCR ERROR:", err);
    throw err;
  }
}

module.exports = { geminiOCR };
