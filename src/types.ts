export interface Product {
  id: string;
  title: string;
  category: 'AI Tools' | 'Templates' | 'Planners';
  price: number;
  rating: number;
  downloads: string;
  description: string;
  badge?: string;
  format: string;
  platform: string;
  earningPotential: string;
  promptPreview: string;
  isFullWidth?: boolean;
}

export interface SlideData {
  id: number;
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  highlightWord: string;
  description: string;
  categories: string[];
  subtext1: string;
  subtext2: string;
}
