import { lexer } from '../lexer/lexer';
import type { LexerResult } from '../lexer/lexer';

export type { Token, LexerResult } from '../lexer/lexer';

// Runs the lexer locally; same normalization the Express server applied.
export async function analyzeCode(code: string): Promise<LexerResult> {
  const normalizedCode = code.replace(/\\n/g, '\n');
  return lexer(normalizedCode);
}
