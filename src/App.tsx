import React, { useState, useEffect } from 'react';
import ResizablePanel from './components/ResizablePanel';
import InputPanel from './components/InputPanel';
import PromptPanel from './components/PromptPanel';
import OutputPanel from './components/OutputPanel';
import { VocItem } from './types';
import './styles/App.css';

interface PromptMessage {
  role: 'system' | 'user';
  content: string;
}

// 변수 처리 함수 - App 레벨에서도 처리
const processVariables = (prompt: string, data: any[]): string => {
  if (!prompt || !prompt.includes('{{input.')) {
    return prompt;
  }
  
  console.log('[App] 변수 처리 시작');
  console.log('[App] 입력 데이터 길이:', data.length);
  console.log('[App] 처리할 프롬프트:', prompt);
  
  let result = prompt;
  const variablePattern = /\{\{input\.([^}]+)\}\}/g;
  let match;
  
  while ((match = variablePattern.exec(prompt)) !== null) {
    const fullMatch = match[0];
    const fieldName = match[1];
    
    console.log(`[App] 변수 발견: ${fullMatch}`);
    console.log(`[App] 필드명: ${fieldName}`);
    
    // 데이터에서 값 수집
    const values = data
      .filter(item => item && typeof item === 'object')
      .map(item => item[fieldName])
      .filter(value => value !== undefined && value !== null);
    
    console.log(`[App] 수집된 값들:`, values);
    
    if (values.length > 0) {
      const replacement = values.join('\n');
      result = result.replace(new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
      console.log(`[App] 변수 대체 완료: ${fullMatch} -> ${replacement}`);
    } else {
      console.warn(`[App] 경고: ${fieldName}에 대한 값이 없습니다`);
    }
  }
  
  // 최종 결과 확인
  if (result.includes('{{input.')) {
    console.warn('[App] 경고: 처리되지 않은 변수가 남아있습니다');
  } else {
    console.log('[App] 모든 변수가 처리되었습니다');
  }
  
  return result;
};

const App: React.FC = () => {
  const [processedData, setProcessedData] = useState<VocItem[]>([]);
  const [results, setResults] = useState<VocItem[]>([]);
  const [prompt, setPrompt] = useState<PromptMessage[]>([]);
  const [inputWidth, setInputWidth] = useState('35%');
  const [promptWidth, setPromptWidth] = useState('30%');

  // 데이터 변경 시 로그 출력
  useEffect(() => {
    console.log('[App] 데이터 변경됨, 길이:', processedData.length);
    if (processedData.length > 0) {
      console.log('[App] 첫 번째 데이터 샘플:', processedData[0]);
    }
  }, [processedData]);

  // 프롬프트 변경 시 로그 출력
  useEffect(() => {
    console.log('[App] 프롬프트 변경됨:', prompt);
  }, [prompt]);

  // 데이터 처리 핸들러
  const handleDataProcessed = (data: VocItem[]) => {
    console.log('[App] 데이터 처리됨, 길이:', data.length);
    if (data.length > 0) {
      console.log('[App] 첫 번째 데이터 샘플:', data[0]);
    }
    setProcessedData(data);
  };

  // 프롬프트 제출 핸들러
  const handlePromptSubmit = (systemPrompt: string, userPrompt: string) => {
    console.log('[App] 프롬프트 제출 시작');
    console.log('[App] 시스템 프롬프트:', systemPrompt);
    console.log('[App] 유저 프롬프트:', userPrompt);
    console.log('[App] 처리된 데이터:', processedData);
    
    let finalProcessedPrompt = userPrompt;
    
    // 변수 처리
    if (userPrompt && userPrompt.includes('{{input.') && processedData.length > 0) {
      console.log('[App] 변수 처리 시작');
      finalProcessedPrompt = processVariables(userPrompt, processedData);
      
      // 변수 처리 결과 확인
      if (finalProcessedPrompt.includes('{{input.')) {
        console.warn('[App] 경고: 일부 변수가 처리되지 않았습니다');
      } else {
        console.log('[App] 모든 변수가 성공적으로 처리되었습니다');
      }
    }
    
    const messages: PromptMessage[] = [];
    
    if (systemPrompt?.trim()) {
      messages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }
    
    messages.push({
      role: 'user',
      content: finalProcessedPrompt
    });
    
    console.log('[App] 최종 메시지:', messages);
    setPrompt(messages);
  };

  return (
    <div className="app-container">
      <div className="panels-container">
        <ResizablePanel 
          title="Input" 
          width={inputWidth}
          onWidthChange={setInputWidth}
        >
          <InputPanel onDataProcessed={handleDataProcessed} />
        </ResizablePanel>
        
        <ResizablePanel 
          title="Prompt"
          width={promptWidth}
          onWidthChange={setPromptWidth}
        >
          <PromptPanel 
            onSubmit={handlePromptSubmit}
            data={processedData}
          />
        </ResizablePanel>
        
        <div className="fixed-panel">
          <div className="panel-header">
            <h3 className="panel-title">Output</h3>
          </div>
          <div className="panel-content">
            <OutputPanel prompt={prompt} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 