import { GoogleGenAI, Type } from "@google/genai";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutRegion {
  id: string;
  type: 'header' | 'paragraph' | 'table' | 'key_value_zone' | 'signature' | 'stamp' | 'handwritten' | 'printed' | 'footer';
  bbox: BoundingBox;
  confidence: number;
  text_preview: string;
  reading_order: number;
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  bbox?: BoundingBox;
  normalized_value?: string | number;
}

export interface TamperSignal {
  region: BoundingBox;
  reason: string;
  confidence: number;
}

export interface DocAnalysis {
  type: string;
  confidence: number;
  readabilityScore: number;
  text: string;
  summary: string;
  language: string;
  sentiment: string;
  intent: string;
  isHandwritten: boolean;
  smartAction: string;
  
  tamperAnalysis: {
    riskScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    explanation: string;
    signals: TamperSignal[];
  };
  
  layoutAnalysis: {
    regions: LayoutRegion[];
    counts: {
      headers: number;
      paragraphs: number;
      tables: number;
      signatures: number;
      handwritten_regions: number;
    };
  };
  
  extractedFields: {
    fields: ExtractedField[];
    summary: {
      field_count: number;
      high_confidence_fields: number;
      uncertain_fields: number;
    };
  };

  quality: {
    score: number;
    blur: boolean;
    brightness: string;
  };
}

export interface SimilarityAnalysis {
  score: number;
  differences: string[];
  commonElements: string[];
}

export async function analyzeDocument(base64Image: string, customPrompt?: string): Promise<DocAnalysis> {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = customPrompt || `Analyze this document image with extreme precision for a high-end Computer Vision project.
  Perform the following tasks:
  1. OCR (MANDATORY): Transcribe EVERY visible character from the image accurately and completely into the "text" field. Do not summarize; provide the full raw content as it appears.
  2. Forgery Scan: Detect potential tampering (ELA, copy-move, noise inconsistency, font irregularity, signature suspicion). Return a risk score (0-100), level, and a list of suspicious regions with bounding boxes and reasons.
  3. Layout Intelligence: Segment the document into regions (header, paragraph, table, key_value_zone, signature, stamp, handwritten, printed, footer). Return bounding boxes and confidence for each.
  4. Smart Field Extraction: Extract structured data (dates, amounts, names, IDs, invoice numbers, etc.). Return bounding boxes for each field if possible.
  5. Intelligence: Detect sentiment, intent, and suggest a smart action.
  6. Quality: Assess readability score (0-100) and image quality.

  Return the results in the following JSON format:
  {
    "type": "string",
    "confidence": number,
    "readabilityScore": number,
    "text": "string",
    "summary": "string",
    "language": "string",
    "sentiment": "string",
    "intent": "string",
    "isHandwritten": boolean,
    "smartAction": "string",
    "tamperAnalysis": {
      "riskScore": number,
      "riskLevel": "Low | Moderate | High",
      "explanation": "string",
      "signals": [{ "region": { "x": number, "y": number, "w": number, "h": number }, "reason": "string", "confidence": number }]
    },
    "layoutAnalysis": {
      "regions": [{ "id": "string", "type": "string", "bbox": { "x": number, "y": number, "w": number, "h": number }, "confidence": number, "text_preview": "string", "reading_order": number }],
      "counts": { "headers": number, "paragraphs": number, "tables": number, "signatures": number, "handwritten_regions": number }
    },
    "extractedFields": {
      "fields": [{ "name": "string", "value": "string", "confidence": number, "bbox": { "x": number, "y": number, "w": number, "h": number }, "normalized_value": "string | number" }],
      "summary": { "field_count": number, "high_confidence_fields": number, "uncertain_fields": number }
    },
    "quality": { "score": number, "blur": boolean, "brightness": "string" }
  }`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    }
  });

  return JSON.parse(response.text || "{}") as DocAnalysis;
}

export async function compareDocuments(img1: string, img2: string): Promise<SimilarityAnalysis> {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = `Compare these two document images. 
  1. Calculate a similarity score (0-100).
  2. Identify key differences.
  3. Identify common elements.
  
  Return the results in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: img1.split(",")[1] || img1,
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: img2.split(",")[1] || img2,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          differences: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          commonElements: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "differences", "commonElements"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as SimilarityAnalysis;
}

export async function askQuestion(base64Image: string, question: string): Promise<string> {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are a document intelligence expert. Answer the following question based ONLY on the provided document image.
  If the answer is not in the document, say "I cannot find information about this in the document."
  
  Question: ${question}`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
  });

  return response.text || "No response from AI.";
}
