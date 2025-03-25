# VOC (Voice of Customer)

고객의 피드백을 분석하고 인사이트를 도출하는 AI 기반 VOC 분석 도구입니다.

## 기능

- 고객 피드백 텍스트 입력
- Azure OpenAI를 활용한 피드백 분석
- 분석 결과를 텍스트 및 JSON 형식으로 표시
- 실시간 응답 생성

## 기술 스택

- Frontend: React + TypeScript
- Backend: Express.js
- AI: Azure OpenAI API
- 스타일링: CSS

## 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- npm
- Azure OpenAI API 키

### 설치

1. 저장소 클론
```bash
git clone [repository-url]
cd voc
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정합니다:
```
PORT=3001
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
```

### 실행

1. React 앱 실행 (Frontend)
```bash
npm start
```
Frontend는 http://localhost:3000 에서 실행됩니다.

2. Express 서버 실행 (Backend)
```bash
npm run server
```
Backend는 http://localhost:3001 에서 실행됩니다.

## 사용 방법

1. 입력 패널에 분석하고 싶은 고객 피드백 텍스트를 입력합니다.
2. "전송" 버튼을 클릭하여 분석을 시작합니다.
3. AI가 피드백을 분석하고 결과를 표시합니다.
4. "JSON 보기" 버튼을 클릭하여 원본 데이터를 확인할 수 있습니다.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 