
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // 可以加上你自己的驗證與處理邏輯
    console.log('LINE Webhook received:', req.body);
    return res.status(200).send('OK');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
