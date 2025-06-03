export interface Token {
  type: string;
  lexeme: string;
  row: number;
  col: number;
}

const tokenSpecs: [string, RegExp][] = [
  ['RESERVED', /^Jugador\b/],
  ['COLON', /^:/],
  ['STRING', /^"[^"]*"/],
  ['LBRACE', /^\{/],
  ['RBRACE', /^\}/],
  ['LPAREN', /^\(/],
  ['RPAREN', /^\)/],
  ['LBRACKET', /^\[/],
  ['RBRACKET', /^\]/],
  ['ASSIGN', /^:=/],
  ['EQUAL', /^=/],
  ['SEMICOLON', /^;/],
  ['NUMBER', /^\d+/],
  ['IDENTIFIER', /^[a-zA-ZáéíóúÁÉÍÓÚñÑ_][a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]*/],
  ['NEWLINE', /^\n/],
  ['WHITESPACE', /^[ \t\r]+/],
];

export function lexer(input: string): Token[] {
  const tokens: Token[] = [];
  let row = 1;
  let col = 1;
  let i = 0;

  while (i < input.length) {
    let match = null;
    let matchedType = '';
    for (const [type, regex] of tokenSpecs) {
      match = regex.exec(input.slice(i));
      if (match) {
        matchedType = type;
        break;
      }
    }
    if (!match) {
      tokens.push({ type: 'UNKNOWN', lexeme: input[i], row, col });
      if (input[i] === '\n') {
        row++;
        col = 1;
      } else {
        col++;
      }
      i++;
      continue;
    }
    const lexeme = match[0];
    if (matchedType === 'NEWLINE') {
      row++;
      col = 1;
    } else if (matchedType !== 'WHITESPACE') {
      tokens.push({ type: matchedType, lexeme, row, col });
      col += lexeme.length;
    } else {
      col += lexeme.length;
    }
    i += lexeme.length;
  }
  return tokens;
} 