import { middleware, Client } from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

export const configRuntime = {
  api: {
    bodyParser: false, // LINE 需要用 raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const body = Buffer.concat(buffers).toString();

  const signature = req.headers['x-line-signature'];

  const isValid = middleware(config)(req, res, () => true);

  if (!signature || !isValid) {
    return res.status(403).send('Forbidden - Invalid signature');
  }

  try {
    const events = JSON.parse(body).events;
    for (const event of events) {
      if (event.type === 'message') {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `你說的是：「${event.message.text}」`,
        });
      }
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
}
