import React, { useState } from 'react';
import './App.css';
import { HomeView } from './views/HomeView';
import { ErrorLogsView } from './views/ErrorLogsView';
import { TeamView } from './views/TeamView';
import { AppProvider } from './context/AppContext';

type View = 'home' | 'errors' | 'team';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">Analizador</div>
        <div className="nav-menu">
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`} 
            onClick={() => setCurrentView('home')}
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
