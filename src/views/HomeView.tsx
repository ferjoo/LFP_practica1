import React, { useState, useRef, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { lexer } from '../lexer';
import type { Token } from '../lexer';
import { highlightText } from '../highlightHelper';

const initialText = `Jugador: "PokeEvee"{
  "venusaur"[planta] := (
    [salud]=12;
    [ataque]=11;
    [defensa]=15;
  )

  "dragonite"[dragon] := (
    [salud]=10;
    [ataque]=15;
    [defensa]=14;
  )

  "butterfree"[bicho] := (
    [salud]=14;
    [ataque]=10;
    [defensa]=15;
  )

  "snorlax"[normal] := (
    [salud]=15;
    [ataque]=12;
    [defensa]=14;
  )

  "machamp"[lucha] := (
    [salud]=14;
    [ataque]=13;
    [defensa]=11;
  )

  "victreebel"[planta] := (
    [salud]=15;
    [ataque]=14;
    [defensa]=14;
  )

  "flareon"[fuego] := (
    [salud]=12;
    [ataque]=15;
    [defensa]=14;
  )
}`;

interface HomeViewProps {
  onClearEditor: () => void;
}

export const HomeView = forwardRef<{ handleClearEditor: () => void }, HomeViewProps>(({ onClearEditor }, ref) => {
  const [editorText, setEditorText] = useState(initialText);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [displayTokens, setDisplayTokens] = useState<Token[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useLayoutEffect(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [editorText]);

  const handleAnalyze = () => {
    const result = lexer(editorText);
    setTokens(result);
    setDisplayTokens(result);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditorText(newText);
    const result = lexer(newText);
    setTokens(result);
  };

  const handleClearEditor = () => {
    setEditorText('');
    setTokens([]);
    setDisplayTokens([]);
    onClearEditor();
  };

  useImperativeHandle(ref, () => ({
    handleClearEditor
  }));

  return (
    <div className="content">
      <div className="editor-section">
        <div className="editor-label">Editor de Texto</div>
        <div className="highlighted-editor">
          <pre
            className="highlighted-pre"
            ref={preRef}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightText(editorText, tokens) + '\n' }}
          />
          <textarea
            className="editor highlighted-textarea"
            ref={textareaRef}
            value={editorText}
            onChange={handleTextChange}
            spellCheck={false}
            onScroll={e => {
              if (preRef.current) {
                preRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
                preRef.current.scrollLeft = (e.target as HTMLTextAreaElement).scrollLeft;
              }
            }}
          />
        </div>
      </div>

      <div className="analyze-section">
        <button className="analyze-btn" onClick={handleAnalyze}>Analizar</button>
      </div>

      <div className="tokens-section">
        <div className="tokens-label">Tabla de Tokens</div>
        <div className="tokens-table-container">
          <table className="tokens-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Fila</th>
                <th>Columna</th>
                <th>Lexema</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              {displayTokens.map((t, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{t.row}</td>
                  <td>{t.col}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}); 