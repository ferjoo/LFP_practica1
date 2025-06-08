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

export function lexer(input: string): LexerResult {
  const tokens: Token[] = [];
  const errors: Token[] = [];
  let row = 1;
  let col = 1;
  let i = 0;

  while (i < input.length) {
    const startRow = row;
    const startCol = col;
    const char = input[i];

    // Ignorar espacios y tabs
    if (char === ' ' || char === '\t' || char === '\r') {
      i++;
      col++;
      continue;
    }

    // Saltos de línea
    if (char === '\n') {
      i++;
      row++;
      col = 1;
      continue;
    }

    // Símbolos de un solo carácter
    const singleCharTokens: { [key: string]: string } = {
      '{': 'LBRACE',
      '}': 'RBRACE',
      '(': 'LPAREN',
      ')': 'RPAREN',
      '[': 'LBRACKET',
      ']': 'RBRACKET',
      '=': 'EQUAL',
      ';': 'SEMICOLON',
      ':': 'COLON',
      '"': 'QUOTE',
    };
    if (singleCharTokens[char]) {
      const type = singleCharTokens[char];
      // Cadena de texto
      if (char === '"') {
        let lexeme = '"';
        let j = i + 1;
        let closed = false;
        while (j < input.length) {
          if (input[j] === '"') {
            lexeme += '"';
            closed = true;
            break;
          }
          if (input[j] === '\n') {
            break;
          }
          lexeme += input[j];
          j++;
        }
        if (closed) {
          tokens.push({ type: 'STRING', lexeme, row: startRow, col: startCol });
          i = j + 1;
          col += lexeme.length;
        } else {
          errors.push({ type: 'UNCLOSED_STRING', lexeme, row: startRow, col: startCol });
          i = j;
          col += lexeme.length;
        }
        continue;
      }
      // Dos puntos seguidos de igual :=
      if (char === ':' && input[i + 1] === '=') {
        tokens.push({ type: 'ASSIGN', lexeme: ':=', row: startRow, col: startCol });
        i += 2;
        col += 2;
        continue;
      }
      tokens.push({ type, lexeme: char, row: startRow, col: startCol });
      i++;
      col++;
      continue;
    }

    // Números
    if (/[0-9]/.test(char)) {
      let lexeme = char;
      let j = i + 1;
      while (j < input.length && /[0-9]/.test(input[j])) {
        lexeme += input[j];
        j++;
      }
      tokens.push({ type: 'NUMBER', lexeme, row: startRow, col: startCol });
      col += lexeme.length;
      i = j;
      continue;
    }

    // Identificadores y palabras reservadas
    if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ_]/.test(char)) {
      let lexeme = char;
      let j = i + 1;
      while (j < input.length && /[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]/.test(input[j])) {
        lexeme += input[j];
        j++;
      }
      const type = lexeme === 'Jugador' || lexeme === 'Equipo' ? 'RESERVED' : 'IDENTIFIER';
      tokens.push({ type, lexeme, row: startRow, col: startCol });
      col += lexeme.length;
      i = j;
      continue;
    }

    // Caracter desconocido
    errors.push({ type: 'UNKNOWN', lexeme: char, row: startRow, col: startCol });
    i++;
    col++;
  }

  return { tokens, errors };
} 