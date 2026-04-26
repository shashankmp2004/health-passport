const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiMessage = {
  role: "user" | "model";
  text: string;
};

type GenerateOptions = {
  systemPrompt: string;
  messages: GeminiMessage[];
};

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return { apiKey, model };
}

export async function generateGeminiAnswer(options: GenerateOptions) {
  const { apiKey, model } = getGeminiConfig();

  const contents = options.messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));

  const response = await fetch(
    `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: options.systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

export type { GeminiMessage };
