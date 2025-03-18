import React, { useState, useEffect, useRef } from 'react';
import '../styles/PromptPanel.css';

interface PromptPanelProps {
  onSubmit: (systemPrompt: string, userPrompt: string) => void;
  data: any[];
}

const PromptPanel: React.FC<PromptPanelProps> = ({ onSubmit, data }) => {
  const defaultSystemPrompt = `당신은 사용자가 관심 있는 뉴스를 필터링하고 분류하는 뉴스 분류기입니다. 
당신의 역할은 사용자가 제공한 뉴스 목록에서 특정 필터링 기준에 따라 적절한 기사를 선별하는 것입니다.

### 분류 기준
✅ 관심 기사 (is_interested = true, score 5~10)
- 주요 빅테크 및 글로벌 기술 기업(Google, OpenAI, Meta, NVIDIA, Microsoft, DeepSeek, Anthropic, Perplexity, Mistral, x.AI 등)이 발표한 생성형 AI 관련 기술적인 세부 내용
- LLM의 새로운 아키텍처 및 원천 기술 변화 (예: DLM(Diffusion Language Model), Mixture of Experts(MoE), Sparse Attention, Retrieval-Augmented Generation(RAG), LLM 최적화 기법, 추론 모델, LMM 모델, 멀티모달 등)
- Llama(라마), GPT-4o, o1, o3, Claude, DeepSeek 등 글로벌 기업의 LLM 모델 관련된 기사

❌ 관심 없는 기사 (is_interested = false, score 0~4)
- 투자 계획(펀딩, 예산 증액, VC 투자 등)
- 인프라 기술(반도체, 서버, 네트워크, 데이터센터 등)
- 단순 통합 발표(클라우드 서비스 연계, 기존 서비스와의 단순한 연동 등)
- 한국 스타트업 관련 기사

### 점수 (score) 부여 기준 (0~10점)
- 9~10: 매우 중요한 생성형 AI 원천 기술 관련 발표 (예: 새로운 모델 아키텍처, 혁신적인 최적화 기법)
- 7~8: 글로벌 주요 기업이 생성형 AI 기술을 직접적으로 개선한 사례
- 5~6: 생성형 AI 활용 사례로 가치가 있지만 기술적 혁신이 크지 않은 경우
- 3~4: 일부 AI 관련성이 있으나, 비핵심적인 내용
- 0~2: 사용자의 관심과 관련 없는 일반적인 비즈니스, 투자, 인프라 기사

### 응답 형식
- 사용자가 제공한 기사 제목을 위의 기준에 따라 \`is_interested\` 값을 \`true\` 또는 \`false\`로 지정하여 분류합니다.
- 각 기사에는 \`score\` 값을 추가하여 중요도를 0~10점으로 표시합니다.
- JSON 형식으로 응답해야 합니다.

### JSON 응답 예시:
\`\`\`json
{
  "articles": [
    {
      "title": "OpenAI, GPT-5 아키텍처 공개",
      "is_interested": true,
      "score": 10
    },
    {
      "title": "Meta, 새로운 LLM 모델 공개",
      "is_interested": true,
      "score": 8
    },
    {
      "title": "NVIDIA, AI 칩 투자 계획 발표",
      "is_interested": false,
      "score": 2
    },
    {
      "title": "한국 스타트업, AI 서비스 출시",
      "is_interested": false,
      "score": 1
    }
  ]
}\`\`\``;

  const defaultUserPrompt = `다음은 기사 제목 목록입니다. 
[필터링 조건]에 맞는 기사만 \`is_interested=true\`로 분류하고, 관심 없는 기사는 \`is_interested=false\`로 설정하여 JSON 형식으로 응답해주세요. 또한, 각 기사마다 중요도를 평가하여 \`score\` (0~10) 값을 추가해주세요.

### 기사 목록
{{input.title}}

JSON 형식으로 결과를 반환해주세요.`;

  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [userPrompt, setUserPrompt] = useState(defaultUserPrompt);
  const isProcessingRef = useRef(false);

  // 변수 처리 함수
  const processVariables = (prompt: string, data: any[]): string => {
    if (!prompt || !prompt.includes('{{input.')) {
      return prompt;
    }
    
    console.log('[PromptPanel] 변수 처리 시작');
    console.log('[PromptPanel] 입력 데이터 길이:', data.length);
    console.log('[PromptPanel] 처리할 프롬프트:', prompt);
    
    let result = prompt;
    const variablePattern = /\{\{input\.([^}]+)\}\}/g;
    let match;
    
    while ((match = variablePattern.exec(prompt)) !== null) {
      const fullMatch = match[0];
      const fieldName = match[1];
      
      console.log(`[PromptPanel] 변수 발견: ${fullMatch}`);
      console.log(`[PromptPanel] 필드명: ${fieldName}`);
      
      // 데이터에서 값 수집
      const values = data
        .filter(item => item && typeof item === 'object')
        .map(item => item[fieldName])
        .filter(value => value !== undefined && value !== null);
      
      console.log(`[PromptPanel] 수집된 값들:`, values);
      
      if (values.length > 0) {
        const replacement = values.join('\n');
        result = result.replace(new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
        console.log(`[PromptPanel] 변수 대체 완료: ${fullMatch} -> ${replacement}`);
      } else {
        console.warn(`[PromptPanel] 경고: ${fieldName}에 대한 값이 없습니다`);
      }
    }
    
    // 최종 결과 확인
    if (result.includes('{{input.')) {
      console.warn('[PromptPanel] 경고: 처리되지 않은 변수가 남아있습니다');
    } else {
      console.log('[PromptPanel] 모든 변수가 처리되었습니다');
    }
    
    return result;
  };

  // 전송 버튼 클릭 시
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    console.log('[PromptPanel] 전송 시작');
    
    try {
      let finalPrompt = userPrompt;
      
      if (data.length > 0 && userPrompt.includes('{{input.')) {
        finalPrompt = processVariables(userPrompt, data);
        
        if (finalPrompt.includes('{{input.')) {
          console.warn('[PromptPanel] 경고: 일부 변수가 처리되지 않았습니다');
        } else {
          console.log('[PromptPanel] 모든 변수가 처리되었습니다');
        }
      }
      
      // 시스템 프롬프트가 비어있으면 기본값 사용
      const finalSystemPrompt = systemPrompt.trim() || defaultSystemPrompt;
      onSubmit(finalSystemPrompt, finalPrompt);
    } catch (error) {
      console.error('[PromptPanel] 전송 중 오류:', error);
      onSubmit(defaultSystemPrompt, userPrompt);
    } finally {
      isProcessingRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prompt-form">
      <div className="prompt-section">
        <label>시스템 프롬프트</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="시스템 프롬프트를 입력하세요"
          className="prompt-textarea"
        />
      </div>
      
      <div className="prompt-section">
        <label>유저 프롬프트</label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="유저 프롬프트를 입력하세요"
          className="prompt-textarea"
        />
      </div>
      
      <button type="submit" className="submit-button">
        전송
      </button>
    </form>
  );
};

export default PromptPanel; 