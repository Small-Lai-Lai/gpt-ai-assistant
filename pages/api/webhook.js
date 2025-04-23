import { middleware, Client } from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const events = req.body.events;

      const results = await Promise.all(events.map(async (event) => {
        // 只處理文字訊息
        if (event.type === 'message' && event.message.type === 'text') {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：「${event.message.text}」`,
          });
        } else {
          // 非文字訊息也要回覆，否則會報錯
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '目前只支援文字訊息喔 😊',
          });
        }
      }));

      res.status(200).json({ status: 'ok', results });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
