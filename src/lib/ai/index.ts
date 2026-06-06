import Groq from "groq-sdk";
import prisma from "../prisma";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function classifyEmail(subject: string, snippet: string, sender: string) {
  const prompt = `
    Analyze the following email and categorize it.
    Sender: ${sender}
    Subject: ${subject}
    Snippet: ${snippet}

    Categories:
    - Important
    - Promotion
    - Newsletter
    - Personal
    - Spam
    - Social
    - Finance
    - Work

    Respond ONLY with a valid JSON object matching this schema exactly:
    {
      "category": "string (one of the exact categories above)",
      "confidence": "number (between 0 and 1)",
      "reason": "string (brief explanation why)"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant", // Updated active model
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const response = chatCompletion.choices[0]?.message?.content;
    if (!response) throw new Error("Empty response from Groq");

    const result = JSON.parse(response);
    return {
      category: result.category,
      confidence: result.confidence,
      reason: result.reason
    };
  } catch (error) {
    console.error("Error classifying email:", error);
    return null;
  }
}
