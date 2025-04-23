import { middleware, Client } from '@line/bot-sdk';

// 設定 LINE Bot SDK 所需的憑證
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// 初始化 LINE Bot 客戶端
const client = new Client(config);

// 頁面 API handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const events = req.body.events;

      // 逐筆處理每個 event
      const results = await Promise.all(events.map(async (event) => {
        // 僅處理文字訊息
        if (event.type === 'message' && event.message.type === 'text') {
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：「${event.message.text}」`,
          });
        }
      }));

      res.status(200).json({ status: 'ok', results });
    } catch (err) {
      console.error('Webhook handler error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
