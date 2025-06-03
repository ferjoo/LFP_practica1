import type { Token } from './lexer';

function getTokenColor(type: string) {
  switch (type) {
    case 'RESERVED':
    case 'IDENTIFIER':
      return 'syntax-blue';
    case 'STRING':
      return 'syntax-orange';
    case 'NUMBER':
      return 'syntax-purple';
    default:
      return 'syntax-black';
  }
}

export function highlightText(text: string, tokens: Token[]): string {
  let html = '';
  let lastRow = 1;
  let lastCol = 1;
  let i = 0;
  let tokenIdx = 0;

  while (i < text.length) {
    const token = tokens[tokenIdx];
    if (token && token.row === lastRow && token.col === lastCol) {
      const colorClass = getTokenColor(token.type);
      const safeLexeme = token.lexeme
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      html += `<span class="${colorClass}">${safeLexeme}</span>`;
      i += token.lexeme.length;
      lastCol += token.lexeme.length;
      tokenIdx++;
    } else {
      const char = text[i];
      if (char === '\n') {
        html += '\n';
        lastRow++;
        lastCol = 1;
      } else {
        html += char === ' ' ? ' ' : `<span class="syntax-black">${char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
        lastCol++;
      }
      i++;
    }
  }
  if (text.endsWith('\n')) html += '\n';
  return html;
} 