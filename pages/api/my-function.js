// pages/api/my-function.js

export default function handler(req, res) {
  res.status(200).json({ message: 'hello from my serverless function!' });
}
