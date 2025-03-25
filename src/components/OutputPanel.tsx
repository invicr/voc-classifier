import React, { useEffect, useState } from 'react';
import '../styles/OutputPanel.css';

interface PromptMessage {
  role: string;
  content: string;
}

interface OutputPanelProps {
  prompt: PromptMessage[];
}

const OutputPanel: React.FC<OutputPanelProps> = ({ prompt }) => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'text' | 'json'>('text');

  useEffect(() => {
    const fetchResponse = async () => {
      if (!prompt || prompt.length === 0) return;

      setIsLoading(true);
      try {
        console.log('요청 메시지:', prompt);
        
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: prompt }),
        });

        if (!response.ok) {
          throw new Error('API 호출 실패');
        }

        const data = await response.json();
        console.log('API 응답:', data);
        setResponse(data.choices[0].message.content || '');
      } catch (error) {
        console.error('=== API 호출 실패 ===');
        console.error('에러:', error);
        setResponse('API 호출 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponse();
  }, [prompt]);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'text' ? 'json' : 'text');
  };

  if (isLoading) {
    return (
      <div className="output-panel">
        <div className="loading">응답을 생성하는 중...</div>
      </div>
    );
  }

  return (
    <div className="output-panel">
      <div className="output-header">
        <h2>응답</h2>
        {prompt && prompt.length > 0 && (
          <button onClick={toggleViewMode} className="view-toggle">
            {viewMode === 'text' ? 'JSON 보기' : '텍스트 보기'}
          </button>
        )}
      </div>
      <div className="output-content">
        {viewMode === 'text' ? (
          <div className="text-response">{response}</div>
        ) : (
          <pre className="json-response">
            {JSON.stringify(prompt, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default OutputPanel; 