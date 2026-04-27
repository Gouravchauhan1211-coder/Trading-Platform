// AI Analysis API Service

export interface AIAnalysisRequest {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  sector: string;
}

export interface AIAnalysisResponse {
  recommendation: string;
  timeframe: string;
  summary: string;
  pros?: string[];
  cons?: string[];
  sentiment?: string;
  rawResponse?: string;
}

export const aiApi = {
  analyzeStock: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    const response = await fetch('/market/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('AI Analysis failed');
    }
    
    const data = await response.json();
    
    // If the backend returns raw JSON string in summary, try to parse it
    try {
      if (data.rawResponse) {
        const parsed = JSON.parse(data.rawResponse);
        return { ...data, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse raw AI response', e);
    }
    
    return data;
  },

  analyzeSentiment: async (headline: string, summary: string): Promise<any> => {
    const response = await fetch('/market/api/ai/sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ headline, summary }),
    });
    
    if (!response.ok) {
      throw new Error('Sentiment Analysis failed');
    }
    
    const data = await response.json();
    try {
      if (data.content) {
        return JSON.parse(data.content);
      }
    } catch (e) {
      console.warn('Failed to parse sentiment content', e);
    }
    return data;
  },
};
