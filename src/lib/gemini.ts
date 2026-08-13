import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

function getClient() {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env and add your key from https://aistudio.google.com/apikey"
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Calls Gemini and forces JSON output matching the given schema.
 * This is the backbone of every agent step: each step is a small,
 * single-purpose call that returns structured data the orchestrator
 * can act on, rather than one giant free-form completion.
 */
export async function generateStructured<T>(params: {
  systemInstruction: string;
  prompt: string;
  schema: object;
  model?: string;
}): Promise<T> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: params.model ?? "gemini-2.5-flash-lite",
    systemInstruction: params.systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: params.schema as any,
      temperature: 0.4,
    },
  });

  const result = await model.generateContent(params.prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`Gemini returned non-JSON output: ${text.slice(0, 500)}`);
  }
}

/** Plain-text generation for cases where we don't need structured JSON. */
export async function generateText(params: {
  systemInstruction: string;
  prompt: string;
  model?: string;
}): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: params.model ?? "gemini-2.5-flash-lite",
    systemInstruction: params.systemInstruction,
  });
  const result = await model.generateContent(params.prompt);
  return result.response.text();
}

export { SchemaType };
