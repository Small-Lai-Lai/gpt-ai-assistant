import OpenAI from "openai";
import { Client } from "@line/bot-sdk";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1", // 保險起見
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const events = req.body.events;

    const results = await Promise.all(
      events.map(async (event) => {
        if (event.type === "message" && event.message.type === "text") {
          const userMessage = event.message.text;

          const chatResponse = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo", // ✅ 若你有 GPT-4 權限也可改成 openai/gpt-4
            messages: [
              { role: "system", content: "你是一個親切的 LINE 聊天夥伴。" },
              { role: "user", content: userMessage },
            ],
          });

          const replyText = chatResponse.choices?.[0]?.message?.content?.trim() || "抱歉，回覆失敗了 😢";

          return client.replyMessage(event.replyToken, {
            type: "text",
            text: replyText,
          });
        }
      })
    );

    return res.status(200).json({ status: "ok", results });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
