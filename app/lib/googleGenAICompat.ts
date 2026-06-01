import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function loadGoogleGenAIModule() {
  const bufferModule = require("buffer");

  // Older transitive deps inside @google/genai still expect buffer.SlowBuffer.
  if (!bufferModule.SlowBuffer) {
    bufferModule.SlowBuffer = bufferModule.Buffer;
  }

  return import("@google/genai");
}

export async function createGoogleGenAIClient(apiKey: string) {
  const { GoogleGenAI } = await loadGoogleGenAIModule();
  return new GoogleGenAI({ apiKey });
}
