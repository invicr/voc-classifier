import React from 'react';
import '../styles/OutputPanel.css';

interface PromptMessage {
  role: 'system' | 'user';
  content: string;
}

interface OutputPanelProps {
  prompt: PromptMessage[];
}

const OutputPanel: React.FC<OutputPanelProps> = ({ prompt }) => {
  const formatJSON = (messages: PromptMessage[]) => {
    if (messages.length === 0) {
      return '프롬프트를 입력하고 전송 버튼을 누르면 결과가 여기에 표시됩니다.';
    }
    
    return messages.map(message => {
      const content = message.content;
      return `{
    "role": "${message.role}",
    "content": """
${content}
"""
}`;
    }).join(',\n');
  };

  return (
    <div className="output-panel">
      <pre className="json-output">
        {formatJSON(prompt)}
      </pre>
    </div>
  );
};

export default OutputPanel; 