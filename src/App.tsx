import React, { useState } from 'react';
import './App.css';
import { HomeView } from './views/HomeView';
import { ErrorLogsView } from './views/ErrorLogsView';
import { TeamView } from './views/TeamView';
import { AppProvider, useApp } from './context/AppContext';

type View = 'home' | 'errors' | 'team';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const { clearEditor, resetToEmpty, setEditorText, editorText } = useApp();

  const handleHomeClick = () => {
    if (currentView === 'home') {
      clearEditor();
    } else {
      setCurrentView('home');
    }
  };

  const handleClearEditor = () => {
    resetToEmpty();
    setCurrentView('home');
  };

  // Cargar archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setEditorText(text);
      setCurrentView('home');
    };
    reader.readAsText(file);
    // Limpiar el valor para poder volver a cargar el mismo archivo si se desea
    e.target.value = '';
  };

  // Guardar archivo
  const handleSaveFile = () => {
    const blob = new Blob([editorText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipo.pklfp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">Analizador</div>
        <div className="nav-menu">
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`} 
            onClick={handleHomeClick}
          >
            Home
          </button>
          <button 
            className={`nav-btn ${currentView === 'team' ? 'active' : ''}`} 
            onClick={() => setCurrentView('team')}
          >
            Mi Equipo
          </button>
          <button 
            className={`nav-btn ${currentView === 'errors' ? 'active' : ''}`} 
            onClick={() => setCurrentView('errors')}
          >
            Error Report
          </button>
          <button
            className="nav-btn"
            onClick={handleClearEditor}
          >
            Limpiar Editor
          </button>
          <label className="nav-btn" style={{ cursor: 'pointer', marginBottom: 0 }}>
            Cargar Archivo
            <input
              type="file"
              accept=".pklfp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
          <button
            className="nav-btn"
            onClick={handleSaveFile}
          >
            Guardar Archivo
          </button>
        </div>
      </nav>

      {currentView === 'home' && <HomeView />}
      {currentView === 'errors' && <ErrorLogsView />}
      {currentView === 'team' && <TeamView />}
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
