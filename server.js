const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const host = '0.0.0.0';  // 모든 IP에서 접속 가능하도록 설정

// CORS 설정
app.use(cors({
  origin: true, // 모든 origin 허용
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
      model: "o3-mini",
      max_tokens: 5000,
      temperature: 0.7,
    });

    res.json(response);
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.listen(port, host, () => {
  console.log(`서버가 다음 주소에서 실행 중입니다:`);
  console.log(`  Local:            http://0.0.0.0:${port}`);
  console.log(`  On Your Network:  http://${host}:${port}`);
}); 