import React from 'react';
import { useAppConfig } from '../contexts/AppContext';

export default function LandingPage({ onStartSimulation }) {
  const { config, loading } = useAppConfig();

  const demoScenarios = [
    {
      title: 'Standard Turnaround',
      description: 'A typical A320 ground operation with normal weather and no disruptions.',
      aircraft: 'A320',
      gate: 'B12',
      weather: 'Clear',
    },
    {
      title: 'Weather Impact',
      description: 'Assess how severe weather affects gate operations and task prioritization.',
      aircraft: 'B737',
      gate: 'A05',
      weather: 'Thunderstorm',
    },
    {
      title: 'Maintenance Delay',
      description: 'Optimize scheduling when unexpected maintenance is discovered.',
      aircraft: 'A380',
      gate: 'C01',
      weather: 'Rainy',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-aero-dark to-aero-card">
      {/* Header */}
      <div className="border-b border-gray-700 bg-aero-dark/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-aero-accent rounded-lg flex items-center justify-center font-bold">K2</div>
            <div>
              <h1 className="font-bold text-xl">K2Think</h1>
              <p className="text-xs text-gray-400">Aero-Logic Optimization Demo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-aero-accent to-blue-400 bg-clip-text text-transparent">
            Aviation Ground Operations Optimizer
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            K2Think uses advanced AI and optimization algorithms to recommend the best gate operation plans for aircraft turnarounds, considering weather, disruptions, and resource constraints.
          </p>
        </div>

        {/* Demo Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {demoScenarios.map((scenario, idx) => (
            <div key={idx} className="bg-aero-card border border-gray-700 rounded-lg p-6 hover:border-aero-accent transition-colors cursor-pointer group">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-aero-accent transition-colors">{scenario.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{scenario.description}</p>
              <div className="flex gap-3 text-xs text-gray-500">
                <span className="bg-aero-dark px-3 py-1 rounded">{scenario.aircraft}</span>
                <span className="bg-aero-dark px-3 py-1 rounded">{scenario.gate}</span>
                <span className="bg-aero-dark px-3 py-1 rounded">{scenario.weather}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onStartSimulation}
            disabled={loading}
            className="px-12 py-4 bg-aero-accent text-aero-dark font-bold rounded-lg hover:bg-aero-accent/90 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Start Simulation'}
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="font-semibold mb-2">AI Powered</h3>
            <p className="text-sm text-gray-400">K2 reasoning engine analyzes complex constraints and generates optimal solutions.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Real-time Metrics</h3>
            <p className="text-sm text-gray-400">Compare plans by turnaround time, resource utilization, and delay impact.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Explainability</h3>
            <p className="text-sm text-gray-400">Understand why K2 recommends each plan with detailed justifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
