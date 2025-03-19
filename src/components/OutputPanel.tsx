import React from 'react';
import '../styles/OutputPanel.css';
import OpenAI from 'openai';

interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OutputPanelProps {
  prompt: PromptMessage[];
}

type ViewMode = 'table' | 'json';

const OutputPanel: React.FC<OutputPanelProps> = ({ prompt }) => {
  const [response, setResponse] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('table');
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  React.useEffect(() => {
    const fetchResponse = async () => {
      if (prompt.length > 0) {
        setIsLoading(true);
        try {
          console.log('=== OpenAI API 호출 시작 ===');
          console.log('API Key:', process.env.OPENAI_API_KEY);
          console.log('요청 메시지:', prompt);
          
          const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: prompt,
          });
          
          console.log('API 응답:', completion);
          setResponse(completion.choices[0].message.content || '');
        } catch (error) {
          console.error('=== OpenAI API 호출 실패 ===');
          console.error('에러 상세:', error);
          setResponse('오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchResponse();
  }, [prompt]);

  const renderTableView = () => {
    if (!response) return null;
    
    try {
      console.log('원본 응답:', response);
      let data;
      try {
        data = JSON.parse(response);
      } catch (e) {
        // JSON이 아닌 경우 문자열로 처리
        return (
          <table className="message-table">
            <tbody>
              <tr>
                <td>{response}</td>
              </tr>
            </tbody>
          </table>
        );
      }
      
      console.log('파싱된 데이터:', data);
      const firstKey = Object.keys(data)[0];
      console.log('첫 번째 키:', firstKey);
      const items = Array.isArray(data[firstKey]) ? data[firstKey] : [data];
      console.log('처리된 아이템:', items);
      
      if (items.length === 0) return <div className="error">데이터가 없습니다.</div>;
      
      const headers = Object.keys(items[0]);
      console.log('헤더:', headers);
      
      return (
        <table className="message-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                {headers.map(header => (
                  <td key={header}>
                    {String(item[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } catch (error) {
      console.error('테이블 변환 에러:', error);
      return <div className="error">테이블 형식으로 변환할 수 없습니다.</div>;
    }
  };

  const renderJsonView = () => {
    if (!response) return null;
    
    try {
      const data = JSON.parse(response);
      return (
        <pre className="json-output">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    } catch (error) {
      return <div className="error">JSON 형식으로 변환할 수 없습니다.</div>;
    }
  };

  return (
    <div className="output-panel">
      {response && (
        <div className="view-mode-buttons">
          <button 
            className={viewMode === 'table' ? 'active' : ''} 
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button 
            className={viewMode === 'json' ? 'active' : ''} 
            onClick={() => setViewMode('json')}
          >
            JSON
          </button>
        </div>
      )}
      <div className="output-content">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <div className="loading-text">응답을 생성하는 중...</div>
          </div>
        ) : response ? (
          viewMode === 'table' ? renderTableView() : renderJsonView()
        ) : (
          '프롬프트를 입력하고 전송 버튼을 누르면 결과가 여기에 표시됩니다.'
        )}
      </div>
    </div>
  );
};

export default OutputPanel; 