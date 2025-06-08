import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { highlightText } from '../highlightHelper';
import { TokenTable } from '../components/TokenTable';
import { useApp } from '../context/AppContext';
import { analyzeCode } from '../api/lexerApi';

function useDebouncedEffect(effect: () => void, deps: unknown[], delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [...deps, delay]);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');
}

export function HomeView() {
  const { editorText, setEditorText, tokens, setTokens, setErrors, setAnalyzed } = useApp();
  const [lastStableHtml, setLastStableHtml] = useState<string>(escapeHtml(editorText));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useLayoutEffect(() => {
    if (textareaRef.current && preRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
  }, [editorText]);

  // Debounced live analysis for highlighting
  useDebouncedEffect(() => {
    let cancelled = false;
    analyzeCode(editorText).then(result => {
      if (!cancelled) {
        setLastStableHtml(highlightText(editorText, result.tokens));
      }
    });
    return () => { cancelled = true; };
  }, [editorText], 100);

  const handleAnalyze = async () => {
    try {
      const result = await analyzeCode(editorText);
      setTokens(result.tokens);
      setErrors(result.errors);
      setAnalyzed(true);
      
      if (result.errors.length > 0) {
        alert(`Se encontraron ${result.errors.length} errores léxicos en el código.`);
      } else {
        alert('Análisis léxico completado con éxito.');
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      alert('Error al analizar el código. Por favor, intente nuevamente.');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditorText(newText);
    setAnalyzed(false);
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
            style={{
              margin: 0,
              font: 'inherit',
              lineHeight: 'inherit',
              padding: 'inherit',
              boxSizing: 'border-box',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              border: 'none',
              background: 'none',
              minHeight: '100%',
            }}
            dangerouslySetInnerHTML={{ __html: lastStableHtml }}
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              resize: 'none',
              background: 'transparent',
              color: 'transparent',
              caretColor: 'black',
              padding: 'inherit',
              font: 'inherit',
              lineHeight: 'inherit',
              border: 'none',
              outline: 'none',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              boxSizing: 'border-box',
              minHeight: '100%',
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