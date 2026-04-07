import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.getConfig()
      .then(setConfig)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppContext.Provider value={{ config, loading, error }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppConfig must be used within AppProvider');
  return context;
}
