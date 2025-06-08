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

  // Palabras reservadas
  const reservedWords = new Set(['Equipo', 'Jugador', 'salud', 'ataque', 'defensa']);

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
            errors.push({ 
              type: 'UNCLOSED_STRING', 
              lexeme: lexeme + '...', 
              row: startRow, 
              col: startCol 
            });
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
      const type = reservedWords.has(lexeme) ? 'RESERVED' : 'IDENTIFIER';
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

  // Verificar estructura general
  let braceCount = 0;
  let parenCount = 0;
  let bracketCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'LBRACE') braceCount++;
    if (token.type === 'RBRACE') braceCount--;
    if (token.type === 'LPAREN') parenCount++;
    if (token.type === 'RPAREN') parenCount--;
    if (token.type === 'LBRACKET') bracketCount++;
    if (token.type === 'RBRACKET') bracketCount--;

    // Verificar asignaciones incompletas
    if (token.type === 'ASSIGN') {
      // Necesitamos verificar los tokens anteriores
      if (i < 4) {
        errors.push({ 
          type: 'INVALID_ASSIGNMENT', 
          lexeme: token.lexeme, 
          row: token.row, 
          col: token.col 
        });
        continue;
      }

      const prevTokens = tokens.slice(i - 4, i);
      const [t1, t2, t3, t4] = prevTokens;

      // Debug log
      console.log('Assignment validation:', {
        assign: token,
        prevTokens: prevTokens.map(t => ({ type: t.type, lexeme: t.lexeme }))
      });

      // Verificar el patrón: STRING [IDENTIFIER] :=
      if (t1.type !== 'STRING' || t2.type !== 'LBRACKET' || t3.type !== 'IDENTIFIER' || t4.type !== 'RBRACKET') {
        errors.push({ 
          type: 'INVALID_ASSIGNMENT', 
          lexeme: token.lexeme, 
          row: token.row, 
          col: token.col 
        });
      }
    }
  }

  if (braceCount !== 0) {
    errors.push({ 
      type: 'UNMATCHED_BRACES', 
      lexeme: braceCount > 0 ? '{' : '}', 
      row: tokens[tokens.length - 1].row, 
      col: tokens[tokens.length - 1].col 
    });
  }

  if (parenCount !== 0) {
    errors.push({ 
      type: 'UNMATCHED_PARENS', 
      lexeme: parenCount > 0 ? '(' : ')', 
      row: tokens[tokens.length - 1].row, 
      col: tokens[tokens.length - 1].col 
    });
  }

  if (bracketCount !== 0) {
    errors.push({ 
      type: 'UNMATCHED_BRACKETS', 
      lexeme: bracketCount > 0 ? '[' : ']', 
      row: tokens[tokens.length - 1].row, 
      col: tokens[tokens.length - 1].col 
    });
  }

  return { tokens, errors };
} 