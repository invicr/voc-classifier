// VOC 관련 타입 정의
export interface VocItem {
  [key: string]: any;
}

export type ViewMode = 'json' | 'table';

export interface ResizablePanelProps {
  title: string;
  children: React.ReactNode;
  width?: string;
  onWidthChange?: (newWidth: string) => void;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: 'horizontal' | 'vertical';
} 