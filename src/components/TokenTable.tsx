import React from 'react';
import type { Token } from '../lexer';

interface TokenTableProps {
  tokens: Token[];
  showErrors?: boolean;
}

export function TokenTable({ tokens, showErrors = false }: TokenTableProps) {
  const getErrorDescription = (token: Token) => {
    switch (token.type) {
      case 'UNKNOWN':
        return 'Caracter desconocido';
      case 'UNMATCHED_CLOSING':
        return 'Cierre de estructura sin apertura correspondiente';
      case 'UNCLOSED_STRUCTURE':
        return 'Estructura sin cerrar';
      default:
        return 'Error desconocido';
    }
  };

  return (
    <div className="tokens-table-container">
      <table className="tokens-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fila</th>
            <th>Columna</th>
            {showErrors ? (
              <>
                <th>Caracter</th>
                <th>Descripción</th>
              </>
            ) : (
              <>
                <th>Lexema</th>
                <th>Token</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{t.row}</td>
              <td>{t.col}</td>
              {showErrors ? (
                <>
                  <td>{t.lexeme}</td>
                  <td>{getErrorDescription(t)}</td>
                </>
              ) : (
                <>
                  <td>{t.lexeme}</td>
                  <td>{t.type === 'RESERVED' ? 'Reservada' : 
                       t.type === 'STRING' ? 'Cadena' :
                       t.type === 'NUMBER' ? 'Número' :
                       t.type === 'IDENTIFIER' ? 'Identificador' :
                       t.type === 'COLON' ? 'Dos Puntos' :
                       t.type === 'LBRACE' ? 'Llave Izquierda' :
                       t.type === 'RBRACE' ? 'Llave Derecha' :
                       t.type === 'LPAREN' ? 'Paréntesis Izquierdo' :
                       t.type === 'RPAREN' ? 'Paréntesis Derecho' :
                       t.type === 'LBRACKET' ? 'Corchete Izquierdo' :
                       t.type === 'RBRACKET' ? 'Corchete Derecho' :
                       t.type === 'ASSIGN' ? 'Asignación' :
                       t.type === 'EQUAL' ? 'Igual' :
                       t.type === 'SEMICOLON' ? 'Punto y Coma' :
                       t.type === 'NEWLINE' ? 'Salto de Línea' :
                       t.type === 'WHITESPACE' ? 'Espacio' : t.type}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 