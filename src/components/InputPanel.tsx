import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ViewMode } from '../types';
import '../styles/InputPanel.css';

interface InputPanelProps {
  onDataProcessed: (data: any[]) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onDataProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // CSV 문자열을 JSON 배열로 변환하는 향상된 함수
  const parseCSV = (csvString: string, delimiter = ','): any[] => {
    console.log('원본 데이터:', csvString.substring(0, 200)); // 디버깅용
    
    // 줄 단위로 분리 (캐리지 리턴 처리)
    const lines = csvString.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('파일이 비어있습니다.');
    }
    
    // 향상된 CSV/TSV 분석 - 따옴표 내부의 구분자 처리
    const parseLine = (line: string): string[] => {
      const values: string[] = [];
      let currentValue = "";
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if ((char === delimiter) && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      
      // 마지막 값 추가
      values.push(currentValue.trim());
      
      // 따옴표 제거
      return values.map(value => {
        if (value.startsWith('"') && value.endsWith('"')) {
          return value.substring(1, value.length - 1);
        }
        return value;
      });
    };
    
    // 첫 번째 행이 헤더인지 확인하고 헤더 추출
    let headerLine = lines[0];
    console.log('헤더 라인:', headerLine); // 디버깅용
    
    // 헤더 파싱
    const header = parseLine(headerLine);
    console.log('헤더 배열:', header); // 디버깅용
    
    // 데이터 행(두 번째 행부터)을 처리
    const result: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      console.log(`라인 ${i} 값:`, values); // 디버깅용
      
      // 헤더와 값을 매핑하여 객체 생성
      const item: Record<string, any> = {};
      
      // 모든 필드를 동적으로 처리 - 헤더 값을 key로 사용
      for (let j = 0; j < header.length; j++) {
        if (j < values.length) {
          const headerKey = header[j];
          const value = values[j];
          
          // 빈 헤더 처리
          if (!headerKey || headerKey.trim() === '') {
            console.log(`빈 헤더 발견: 인덱스 ${j}`);
            continue;
          }
          
          // 숫자인 경우 숫자 타입으로 변환, 그렇지 않으면 문자열로 유지
          const numberValue = Number(value);
          
          // 유효한 숫자인 경우에만 숫자로 변환
          if (!isNaN(numberValue) && value !== '') {
            item[headerKey] = numberValue;
          } else {
            item[headerKey] = value;
          }
        }
      }
      
      result.push(item);
    }
    
    console.log('파싱 결과:', result); // 디버깅용
    return result;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log('선택된 파일:', selectedFile.name, selectedFile.type);
      
      // 파일 내용 읽기
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (e.target?.result) {
            let fileContent = e.target.result as string;
            
            // BOM(Byte Order Mark) 제거 - UTF-8 인코딩 문제 해결
            if (fileContent.charCodeAt(0) === 0xFEFF) {
              fileContent = fileContent.substring(1);
              console.log('BOM 제거됨');
            }
            
            console.log('파일 내용 타입:', typeof fileContent);
            console.log('파일 내용 길이:', fileContent.length);
            console.log('파일 내용 시작 부분:', fileContent.substring(0, 100));
            
            let vocItems: any[] = [];
            
            // 파일 확장자에 따라 다른 처리
            const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
            console.log('파일 확장자:', fileExtension);
            
            if (fileExtension === 'csv') {
              // CSV 파일 처리
              vocItems = parseCSV(fileContent, ',');
            } else if (fileExtension === 'tsv' || fileExtension === 'txt') {
              // TSV 파일 처리 (탭으로 구분)
              vocItems = parseCSV(fileContent, '\t');
            } else if (fileExtension === 'json') {
              // JSON 파일 처리
              const parsedData = JSON.parse(fileContent);
              console.log('JSON 파싱 결과:', parsedData);
              
              if (Array.isArray(parsedData)) {
                vocItems = parsedData;
              } else {
                vocItems = [parsedData];
              }
            } else {
              // 기본적으로 JSON으로 파싱 시도
              try {
                const parsedData = JSON.parse(fileContent);
                vocItems = Array.isArray(parsedData) ? parsedData : [parsedData];
              } catch (jsonError) {
                console.error('JSON 파싱 실패, CSV로 시도:', jsonError);
                vocItems = parseCSV(fileContent, ',');
              }
            }
            
            console.log('최종 처리된 데이터:', vocItems);
            setData(vocItems);
            
            // 데이터가 있으면 바로 전달
            if (vocItems.length > 0) {
              onDataProcessed(vocItems);
            }
          }
        } catch (error) {
          console.error('파일 파싱 오류:', error);
          alert('파일 형식이 올바르지 않습니다. CSV 또는 JSON 형식을 확인해주세요.');
        }
      };
      
      reader.readAsText(selectedFile, 'UTF-8');
    }
  }, [onDataProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json']
    }
  });

  const handleSubmit = () => {
    if (!data.length) return;
    
    console.log('[InputPanel] 데이터 제출, 길이:', data.length);
    
    if (data.length > 0) {
      console.log('[InputPanel] 첫 번째 데이터:', data[0]);
      // title 필드의 존재 여부 확인
      if (data[0].title) {
        console.log('[InputPanel] 첫 번째 title 값:', data[0].title);
      } else {
        // title 필드가 없을 경우
        console.log('[InputPanel] title 필드가 존재하지 않습니다. 전체 필드명:', Object.keys(data[0]));
      }
    }
    
    setIsLoading(true);
    // 실제로는 여기서 API 호출 등의 처리를 하겠지만, 현재는 바로 데이터를 전달합니다
    setTimeout(() => {
      // 데이터를 직접 전달
      onDataProcessed(data);
      console.log('[InputPanel] onDataProcessed 콜백 호출 완료');
      setIsLoading(false);
    }, 500); // 로딩 효과를 위한 지연
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('선택된 파일:', file.name, file.type);
      const text = await file.text();
      console.log('파일 내용 타입:', typeof text);
      console.log('파일 내용 길이:', text.length);
      console.log('파일 내용 시작 부분:', text.substring(0, 50));
      
      setFileContent(text);
      setFileName(file.name);
      
      // 파일 확장자 확인
      const extension = file.name.split('.').pop()?.toLowerCase();
      console.log('파일 확장자:', extension);
      
      if (extension === 'csv') {
        const parsedData = parseCSV(text);
        console.log('파싱 결과:', parsedData);
        
        if (parsedData.length > 0) {
          const processedData = parsedData.map(item => ({
            title: item.title || '',
            date: item.date || ''
          }));
          console.log('최종 처리된 데이터:', processedData);
          
          // 데이터 처리 완료 후 콜백 호출
          onDataProcessed(processedData);
        }
      }
    } catch (error) {
      console.error('파일 처리 중 오류:', error);
    }
  };

  const renderContent = () => {
    if (!file) {
      return (
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>파일을 여기에 놓으세요</p>
          ) : (
            <p>CSV 또는 JSON 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
          )}
        </div>
      );
    }

    return (
      <div className="file-preview">
        <div className="file-info">
          <p><strong>파일:</strong> {file.name}</p>
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
        </div>
        
        <div className="data-preview">
          {viewMode === 'json' ? (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          ) : (
            <table>
              <thead>
                <tr>
                  {data.length > 0 && 
                    Object.keys(data[0]).map(key => <th key={key}>{key}</th>)
                  }
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.entries(item).map(([key, value]) => (
                      <td key={key}>
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="upload-again-button" 
            onClick={() => {
              setFile(null);
              setData([]);
            }}
          >
            다시 업로드
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="input-panel-content">
      {renderContent()}
    </div>
  );
};

export default InputPanel; 