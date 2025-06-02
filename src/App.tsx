import React, { useState } from 'react';
import './App.css';

const initialText = `Jugador: "PokeEvee"{
  "venusaur[planta]" = (
    [ataque]=12;
    [defensa]=11;
  )
  "dragonite[dragon]" = (
    [ataque]=15;
    [defensa]=14;
  )
}`;

const initialTokens = [
  { no: 1, fila: 1, columna: 1, lexema: 'Jugador', token: 'Palabra Reservada' },
  { no: 2, fila: 2, columna: 8, lexema: ':', token: 'Dos Puntos' },
  { no: 3, fila: 3, columna: 11, lexema: '"PokeEvee"', token: 'Cadena de Texto' },
  { no: 4, fila: 3, columna: 21, lexema: '{', token: 'Llaves Abre' },
  { no: 5, fila: 5, columna: 15, lexema: '[', token: 'Corchete Abre' },
  { no: 6, fila: 6, columna: 17, lexema: '=', token: 'Stats Abre' },
  { no: 7, fila: 7, columna: 19, lexema: ';', token: 'Punto y Coma' },
];

function App() {
  const [editorText, setEditorText] = useState(initialText);
  const [tokens] = useState(initialTokens);

  const handleAnalyze = () => {
    // Aquí iría la lógica de análisis léxico
    alert('Análisis léxico simulado.');
  };

  const handleClearEditor = () => setEditorText('');
  const handleLoadFile = () => alert('Funcionalidad de cargar archivo no implementada.');
  const handleSaveFile = () => alert('Funcionalidad de guardar archivo no implementada.');

  return (
    <div className="main-container">
      {/* Barra de navegación */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="logo">Pokemon USAC</span>
          <a href="#" onClick={() => window.location.reload()}>Home</a>
          <a href="#" onClick={() => alert('Mostrar tabla de errores léxicos')}>Error Report</a>
          <div className="dropdown">
            <button className="dropbtn">Archivo ▼</button>
            <div className="dropdown-content">
              <button onClick={handleClearEditor}>Limpiar Editor</button>
              <button onClick={handleLoadFile}>Cargar Archivo</button>
              <button onClick={handleSaveFile}>Guardar Archivo</button>
            </div>
          </div>
          <a href="#" onClick={() => alert('Manual Técnico')}>Manual Técnico</a>
          <a href="#" onClick={() => alert('Manual de Usuario')}>Manual de Usuario</a>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="content">
        {/* Editor de texto */}
        <div className="editor-section">
          <div className="editor-label">Editor de Texto</div>
          <textarea
            className="editor"
            value={editorText}
            onChange={e => setEditorText(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Botón Analizar */}
        <div className="analyze-section">
          <button className="analyze-btn" onClick={handleAnalyze}>Analizar</button>
        </div>

        {/* Tabla de tokens */}
        <div className="tokens-section">
          <div className="tokens-label">Tabla de Tokens</div>
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
              {tokens.map(t => (
                <tr key={t.no}>
                  <td>{t.no}</td>
                  <td>{t.fila}</td>
                  <td>{t.columna}</td>
                  <td>{t.lexema}</td>
                  <td>{t.token}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
