export default async function handler(req, res) {
  if (req.method === 'POST') {
    const event = req.body.events?.[0]

    if (event?.type === 'message' && event.message.type === 'text') {
      try {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: `你說的是：「${event.message.text}」`,
        })
        return res.status(200).json({ status: 'ok' })
      } catch (err) {
        console.error('回覆訊息失敗:', err)
        return res.status(500).json({ error: '回覆訊息失敗' })
      }
    }

    return res.status(200).json({ status: 'ok (not a text message)' })
  }

  res.status(405).send('Method Not Allowed')
}
