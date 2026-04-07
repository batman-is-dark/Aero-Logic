import React, { useState, useEffect } from 'react';
import { useAppConfig } from '../contexts/AppContext';

export default function ScenarioPanel({ onOptimize, isLoading }) {
  const { config } = useAppConfig();
  const [scenario, setScenario] = useState({
    aircraft_type: 'A320',
    gate: 'B12',
    weather: 'Clear',
    scheduled_departure: null,
  });

  const handleChange = (field, value) => {
    setScenario(prev => ({ ...prev, [field]: value }));
  };

  const handleOptimize = () => {
    onOptimize({ scenario });
  };

  if (!config) return <div className="text-gray-400">Loading config...</div>;

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg p-6 space-y-4 sticky top-24">
      <h2 className="text-lg font-semibold text-white mb-6">Scenario Config</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Aircraft Type</label>
        <select
          value={scenario.aircraft_type}
          onChange={(e) => handleChange('aircraft_type', e.target.value)}
          className="w-full bg-aero-dark border border-gray-700 text-white rounded px-3 py-2 focus:border-aero-accent focus:outline-none text-sm"
        >
          {config.aircraft?.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Gate</label>
        <input
          type="text"
          value={scenario.gate}
          onChange={(e) => handleChange('gate', e.target.value)}
          className="w-full bg-aero-dark border border-gray-700 text-white rounded px-3 py-2 focus:border-aero-accent focus:outline-none text-sm"
          placeholder="e.g., B12"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Weather</label>
        <select
          value={scenario.weather}
          onChange={(e) => handleChange('weather', e.target.value)}
          className="w-full bg-aero-dark border border-gray-700 text-white rounded px-3 py-2 focus:border-aero-accent focus:outline-none text-sm"
        >
          {config.weather?.map(w => (
            <option key={w.name} value={w.name}>{w.name}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleOptimize}
        disabled={isLoading}
        className="w-full mt-8 px-4 py-2 bg-aero-accent text-aero-dark font-semibold rounded-lg hover:bg-aero-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Optimizing...' : 'Run Optimization'}
      </button>
    </div>
  );
}
