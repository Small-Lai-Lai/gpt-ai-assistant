import { Configuration, OpenAIApi } from "openai";
import { middleware, Client } from "@line/bot-sdk";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

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

          const chatResponse = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
              { role: "system", content: "你是一個親切的 LINE 聊天夥伴。" },
              { role: "user", content: userMessage },
            ],
          });

          const replyText = chatResponse.data.choices[0].message.content.trim();

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
