import OpenAI from 'openai';

const aiUrl = process.env.AGNES_AI_BASE_URL || 'https://apihub.agnes-ai.com/v1';
const apiKey = process.env.AGNES_AI_API_KEY_4 || process.env.AGNES_AI_API_KEY;

export const agnesAi = new OpenAI({
  baseURL: aiUrl,
  apiKey: apiKey,
});

export async function generateChatResponse(messages: { role: string; content: string }[]) {
  try {
    const completion = await agnesAi.chat.completions.create({
      model: "agnes-2.5-flash", // Model default yang lebih umum
      messages: messages as any,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Agnes AI Error:", error);
    throw error;
  }
}
