import React, { useState, useRef, useEffect } from 'react';
import { ResizablePanelProps } from '../types';
import '../styles/ResizablePanel.css';

const ResizablePanel: React.FC<ResizablePanelProps> = ({ 
  title, 
  children, 
  width = '33%',
  onWidthChange
}) => {
  const [panelWidth, setPanelWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const initialX = useRef<number>(0);
  const initialWidth = useRef<number>(0);

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing(true);
    initialX.current = e.clientX;
    initialWidth.current = panelRef.current?.offsetWidth || 0;
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const dx = e.clientX - initialX.current;
    const newWidth = initialWidth.current + dx;
    const parentWidth = panelRef.current?.parentElement?.offsetWidth || 1;
    const percentWidth = `${Math.max(10, Math.min(90, (newWidth / parentWidth) * 100))}%`;
    
    setPanelWidth(percentWidth);
    if (onWidthChange) onWidthChange(percentWidth);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, [isResizing]);

  return (
    <div 
      className="resizable-panel" 
      ref={panelRef}
      style={{ width: panelWidth }}
    >
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
      </div>
      <div className="panel-content">
        {children}
      </div>
      <div 
        className="resize-handle"
        onMouseDown={startResize}
      />
    </div>
  );
};

export default ResizablePanel; 