import React, { useRef } from 'react';
import './App.css';
import { HomeView } from './views/HomeView';

function App() {
  const homeViewRef = useRef<{ handleClearEditor: () => void }>(null);

  const handleClearEditor = () => {
    if (homeViewRef.current) {
      homeViewRef.current.handleClearEditor();
    }
  };

  const handleLoadFile = () => alert('Funcionalidad de cargar archivo no implementada.');
  const handleSaveFile = () => alert('Funcionalidad de guardar archivo no implementada.');

  return (
    <div className="main-container">
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

      <HomeView ref={homeViewRef} onClearEditor={handleClearEditor} />
    </div>
  );
}

export default App;
