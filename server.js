const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000', // React 앱의 주소
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Azure OpenAI 클라이언트 초기화
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-02-15-preview",
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  defaultQuery: { 'api-version': '2024-02-15-preview' }
});

// 채팅 완성 API 엔드포인트
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const response = await client.chat.completions.create({
      messages: messages,
      model: "gpt-4",
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.json(response);
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
}); 