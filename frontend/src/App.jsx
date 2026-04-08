import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import LandingPage from './components/LandingPage';
import SimulationPage from './components/SimulationPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div className="min-h-screen bg-aero-dark">
      {currentPage === 'landing' ? (
        <LandingPage onStartSimulation={() => setCurrentPage('simulation')} />
      ) : (
        <SimulationPage onBackToLanding={() => setCurrentPage('landing')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
