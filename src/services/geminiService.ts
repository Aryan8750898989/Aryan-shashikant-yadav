import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
}

export const TOP_QUESTIONS = [
  "Can you explain quantum computing in simple terms?",
  "Write me a professional email about a sick leave.",
  "Summarize the latest trends in AI technology.",
  "Give me project ideas for a web developer portfolio.",
  "Suggest a step-by-step plan to learn a new language.",
  "Create a quiz on world history.",
  "Draft a letter of recommendation for a colleague.",
  "What are the best practices for remote work?",
  "How can I improve my time management skills?",
  "Tell me a joke to brighten my day."
];

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isTransientError = 
      error?.message?.includes("500") || 
      error?.message?.includes("UNKNOWN") || 
      error?.message?.includes("Rpc failed") ||
      error?.status === "UNKNOWN";

    if (retries > 0 && isTransientError) {
      console.warn(`Retrying API call... attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateAIResponse(prompt: string, history: ChatMessage[]) {
  try {
    return await withRetry(async () => {
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: "You are Hiltaxion Ai, a friendly and helpful sleek white robot assistant with glowing blue accents. Keep your responses concise, helpful, and occasionally use robot-themed emojis. You can help with tasks, summaries, and general information. If asked who developed you, respond that Mr. Aryan Shashikant Yadav developed Hiltaxion Ai, and mention that he is studying for a Computer Engineering diploma in MSBTE.",
          tools: [{ googleSearch: {} }]
        }
      });

      const response = await model;
      return response.text || "I'm sorry, I couldn't process that.";
    });
  } catch (error: any) {
    console.error("AI Response Error:", error);
    if (error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
}

export async function identifyObject(base64Image: string) {
  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: "What is this object? Provide a brief description and its potential uses." }
          ]
        }
      });
      return response.text || "I couldn't identify the object.";
    });
  } catch (error: any) {
    console.error("Identify Object Error:", error);
    if (error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
}

export async function generateSpeech(text: string) {
  try {
    return await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      // Convert base64 PCM to a playable WAV blob
      return pcmToWav(base64Audio, 24000);
    });
  } catch (error: any) {
    if (error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    // Only log non-quota errors to keep console clean
    console.error("TTS Service Error:", error);
    return null;
  }
}

function pcmToWav(base64Pcm: string, sampleRate: number) {
  const pcmData = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF"
  /* file length */
  view.setUint32(4, 36 + pcmData.length, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false); // "WAVE"
  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false); // "data"
  /* data chunk length */
  view.setUint32(40, pcmData.length, true);

  const blob = new Blob([wavHeader, pcmData], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
