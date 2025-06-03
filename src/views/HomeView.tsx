import React, { useRef, useLayoutEffect } from 'react';
import { lexer } from '../lexer';
import { highlightText } from '../highlightHelper';
import { TokenTable } from '../components/TokenTable';
import { useApp } from '../context/AppContext';

export function HomeView() {
  const { editorText, setEditorText, tokens, setTokens, setErrors } = useApp();
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
    setTokens(result.tokens);
    setErrors(result.errors);
    
    if (result.errors.length > 0) {
      alert(`Se encontraron ${result.errors.length} errores léxicos en el código.`);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditorText(newText);
    const result = lexer(newText);
    setTokens(result.tokens);
    setErrors(result.errors);
  };

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
        <TokenTable tokens={tokens} />
      </div>
    </div>
  );
} 