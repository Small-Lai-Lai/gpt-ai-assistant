import { Configuration, OpenAIApi } from 'openai';
import { middleware, Client } from '@line/bot-sdk';

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
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const event = req.body.events?.[0];

  if (event?.type === 'message' && event.message?.type === 'text') {
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: event.message.text }
        ]
      });

      const reply = response.data.choices?.[0]?.message?.content || '（沒有回應）';

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: reply,
      });

      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('回覆錯誤:', err);
      return res.status(500).json({ error: 'GPT-4 回覆失敗' });
    }
  }

  return res.status(200).json({ status: 'not a text message' });
}
