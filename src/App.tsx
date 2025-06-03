import React, { useState } from 'react';
import './App.css';
import { HomeView } from './views/HomeView';
import { ErrorLogsView } from './views/ErrorLogsView';
import { AppProvider } from './context/AppContext';

function AppContent() {
  const [showErrors, setShowErrors] = useState(false);

  const handleShowErrors = () => setShowErrors(true);
  const handleShowHome = () => setShowErrors(false);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">Analizador Léxico</div>
        <div className="nav-menu">
          <button className="nav-btn" onClick={handleShowHome}>Home</button>
          <button className="nav-btn" onClick={handleShowErrors}>Error Report</button>
        </div>
      </nav>

      {showErrors ? <ErrorLogsView /> : <HomeView />}
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
