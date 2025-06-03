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

export function lexer(input: string): LexerResult {
  const tokens: Token[] = [];
  const errors: Token[] = [];
  let row = 1;
  let col = 1;
  let i = 0;

  // Stack para rastrear paréntesis, llaves y corchetes
  const stack: { type: string; row: number; col: number }[] = [];

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
      const error = { type: 'UNKNOWN', lexeme: input[i], row, col };
      errors.push(error);
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

    // Manejar apertura de estructuras
    if (matchedType === 'LBRACE' || matchedType === 'LPAREN' || matchedType === 'LBRACKET') {
      stack.push({ type: matchedType, row, col });
    }
    // Manejar cierre de estructuras
    else if (matchedType === 'RBRACE' || matchedType === 'RPAREN' || matchedType === 'RBRACKET') {
      const expectedType = matchedType === 'RBRACE' ? 'LBRACE' :
                          matchedType === 'RPAREN' ? 'LPAREN' :
                          'LBRACKET';
      
      if (stack.length === 0 || stack[stack.length - 1].type !== expectedType) {
        errors.push({
          type: 'UNMATCHED_CLOSING',
          lexeme,
          row,
          col
        });
      } else {
        stack.pop();
      }
    }

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

  // Verificar estructuras sin cerrar
  while (stack.length > 0) {
    const unclosed = stack.pop()!;
    errors.push({
      type: 'UNCLOSED_STRUCTURE',
      lexeme: unclosed.type === 'LBRACE' ? '{' :
              unclosed.type === 'LPAREN' ? '(' :
              '[',
      row: unclosed.row,
      col: unclosed.col
    });
  }

  return { tokens, errors };
} 