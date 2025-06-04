import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface Token {
  type: string;
  lexeme: string;
  row: number;
  col: number;
}

export interface LexerResult {
  tokens: Token[];
  errors: Token[];
}

export async function analyzeCode(code: string): Promise<LexerResult> {
  try {
    const response = await axios.post(`${API_URL}/analyze`, { code });
    return response.data;
  } catch (error) {
    console.error('Error analyzing code:', error);
    throw error;
  }
} 