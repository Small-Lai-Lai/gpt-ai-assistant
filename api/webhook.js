import { Configuration, OpenAIApi } from "openai";
import { middleware, Client } from "@line/bot-sdk";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export const configMiddleware = middleware(config);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await configMiddleware(req, res, async () => {
    const events = req.body.events;
    const results = await Promise.all(events.map(async (event) => {
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;
        const replyToken = event.replyToken;

        try {
          const chat = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: userText }],
          });

          const aiReply = chat.data.choices[0].message.content;

          await client.replyMessage(replyToken, {
            type: "text",
            text: aiReply,
          });

          return { success: true };
        } catch (error) {
          console.error("GPT 回覆失敗", error);
          return { success: false, error };
        }
      }
    }));

    return res.status(200).json({ results });
  });
}
