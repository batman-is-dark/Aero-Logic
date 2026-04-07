# Vite + React Application Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Rebuild the complete Vite + React frontend application with all missing files, creating a working optimization demo interface for the Aero-Logic K2Think system.

**Architecture:** Vite-based SPA with React components using Tailwind CSS. Landing page shows demo showcase, simulation page displays aircraft gate optimization with K2 recommendations, plan cards with metrics, Gantt timeline, comparison table, and explainability panel. Left sidebar for scenario configuration, right side for results and visualization.

**Tech Stack:** Vite 5.4.2, React 18.3.1, Tailwind CSS 3.4.10, PostCSS, React Context for state management

---

## Task 1: Create vite.config.js

**Files:**
- Create: `frontend/vite.config.js`

**Step 1: Write vite config with React plugin**

Create `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})
```

**Step 2: Verify config syntax**

Run: `cd frontend && node -c vite.config.js`
Expected: No syntax errors

---

## Task 2: Create tailwind.config.js and postcss.config.js

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`

**Step 1: Create tailwind config with aero-logic theme**

Create `frontend/tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aero-dark': '#0f172a',
        'aero-card': '#1e293b',
        'aero-accent': '#06b6d4',
        'aero-warning': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**Step 2: Create postcss config**

Create `frontend/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Task 3: Create frontend/index.html

**Files:**
- Create: `frontend/index.html`

**Step 1: Create HTML entry point**

Create `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/k2-logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>K2Think - Aero-Logic Optimization Demo</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

## Task 4: Create frontend/src/main.jsx

**Files:**
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/index.css`

**Step 1: Create React entry point with Tailwind imports**

Create `frontend/src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 2: Create global styles with Tailwind directives**

Create `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-aero-dark text-white font-sans;
  }
  
  input, select, textarea {
    @apply bg-aero-card border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:border-aero-accent;
  }
  
  button {
    @apply transition-colors;
  }
}

@layer components {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #475569 #0f172a;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #0f172a;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
}
```

---

## Task 5: Create frontend/src/services/api.js

**Files:**
- Create: `frontend/src/services/api.js`

**Step 1: Create API client**

Create `frontend/src/services/api.js`:

```javascript
const BASE_URL = '/api';

export const apiClient = {
  async getConfig() {
    const [aircraft, weather, disruptions] = await Promise.all([
      fetch(`${BASE_URL}/config/aircraft-types`).then(r => r.json()),
      fetch(`${BASE_URL}/config/weather-conditions`).then(r => r.json()),
      fetch(`${BASE_URL}/config/disruptions`).then(r => r.json()),
    ]);
    return { aircraft: aircraft.aircraft_types, weather: weather.weather_conditions, disruptions: disruptions.disruptions };
  },

  async optimize(scenarioInput) {
    const response = await fetch(`${BASE_URL}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioInput),
    });
    if (!response.ok) throw new Error('Optimization failed');
    return response.json();
  },

  async generateScenario(params) {
    const response = await fetch(`${BASE_URL}/scenario/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Scenario generation failed');
    return response.json();
  },

  async generateDisruption(disruptionName) {
    const response = await fetch(`${BASE_URL}/scenario/disruption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruption_name: disruptionName }),
    });
    if (!response.ok) throw new Error('Disruption generation failed');
    return response.json();
  },

  async generateRandomScenario() {
    const response = await fetch(`${BASE_URL}/scenario/random`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Random scenario generation failed');
    return response.json();
  },
};
```

---

## Task 6: Create frontend/src/App.jsx

**Files:**
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/contexts/AppContext.jsx`

**Step 1: Create App component with routing logic**

Create `frontend/src/App.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import LandingPage from './components/LandingPage';
import SimulationPage from './components/SimulationPage';

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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

**Step 2: Create App context for global state**

Create `frontend/src/contexts/AppContext.jsx`:

```jsx
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
```

---

## Task 7: Create frontend/src/components/LandingPage.jsx

**Files:**
- Create: `frontend/src/components/LandingPage.jsx`

**Step 1: Create landing page with hero and demo scenarios**

Create `frontend/src/components/LandingPage.jsx`:

```jsx
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
```

---

## Task 8: Create frontend/src/components/SimulationPage.jsx

**Files:**
- Create: `frontend/src/components/SimulationPage.jsx`

**Step 1: Create main simulation page layout**

Create `frontend/src/components/SimulationPage.jsx`:

```jsx
import React, { useState } from 'react';
import ScenarioPanel from './ScenarioPanel';
import { apiClient } from '../services/api';
import PlanCard from './PlanCard';
import GanttTimeline from './GanttTimeline';
import ComparisonTable from './ComparisonTable';
import ExplainabilityPanel from './ExplainabilityPanel';
import OptimizationStatus from './OptimizationStatus';
import { GateDiagram } from './GateDiagram';

export default function SimulationPage({ onBackToLanding }) {
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async (scenarioInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.optimize(scenarioInput);
      setOptimizationResult(result);
      if (result.plans && result.plans.length > 0) {
        setSelectedPlanId(result.selected_plan?.plan_id || result.plans[0].plan_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = optimizationResult?.plans?.find(p => p.plan_id === selectedPlanId);
  const k2Selection = optimizationResult?.selected_plan?.plan_id;

  return (
    <div className="min-h-screen bg-aero-dark">
      {/* Header */}
      <div className="border-b border-gray-700 bg-aero-dark/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Landing</span>
          </button>
          <h1 className="text-2xl font-bold">K2Think Optimization</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <ScenarioPanel onOptimize={handleOptimize} isLoading={loading} />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3 space-y-6">
            {loading && <OptimizationStatus />}

            {optimizationResult && (
              <>
                {/* Plan Cards */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white">Optimization Results</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {optimizationResult.plans.map((plan) => (
                      <PlanCard
                        key={plan.plan_id}
                        plan={plan}
                        isSelected={selectedPlanId === plan.plan_id}
                        isK2Recommended={k2Selection === plan.plan_id}
                        onSelect={() => setSelectedPlanId(plan.plan_id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Gantt Timeline */}
                {selectedPlan && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Task Timeline</h2>
                    <GanttTimeline plan={selectedPlan} />
                  </div>
                )}

                {/* Comparison Table */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Plan Comparison</h2>
                  <ComparisonTable plans={optimizationResult.plans} selectedPlanId={selectedPlanId} />
                </div>

                {/* Explainability Panel */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">K2 Explainability</h2>
                  <ExplainabilityPanel
                    plan={selectedPlan}
                    k2Selection={optimizationResult.selected_plan}
                    allPlans={optimizationResult.plans}
                  />
                </div>

                {/* Gate Diagram */}
                {selectedPlan && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Gate Diagram</h2>
                    <GateDiagram selectedPlan={selectedPlan} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 9: Create frontend/src/components/ScenarioPanel.jsx

**Files:**
- Create: `frontend/src/components/ScenarioPanel.jsx`

**Step 1: Create scenario configuration form**

Create `frontend/src/components/ScenarioPanel.jsx`:

```jsx
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
```

---

## Task 10: Create frontend/src/components/PlanCard.jsx

**Files:**
- Create: `frontend/src/components/PlanCard.jsx`

**Step 1: Create plan card with K2 recommendation badge**

Create `frontend/src/components/PlanCard.jsx`:

```jsx
import React from 'react';

export default function PlanCard({ plan, isSelected, isK2Recommended, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-aero-accent bg-aero-dark/50'
          : isK2Recommended
          ? 'border-aero-warning/60 bg-aero-dark hover:border-aero-warning'
          : 'border-gray-700 bg-aero-card hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{plan.plan_id}</h3>
          <p className="text-sm text-gray-400">{plan.plan_name || 'Optimization Plan'}</p>
        </div>

        <div className="flex gap-2">
          {isK2Recommended && !isSelected && (
            <div className="bg-aero-warning/20 border border-aero-warning px-2 py-1 rounded text-xs font-semibold text-aero-warning flex items-center gap-1">
              <span>⭐</span>
              <span>K2 RECOMMENDED</span>
            </div>
          )}

          {isSelected && (
            <div className="bg-aero-accent/20 border border-aero-accent px-2 py-1 rounded text-xs font-semibold text-aero-accent flex items-center gap-1">
              <span>✓</span>
              <span>OPTIMAL</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Turnaround Time</p>
          <p className="font-semibold text-white">{plan.turnaround_time || 'N/A'}m</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total Delay</p>
          <p className="font-semibold text-white">{plan.total_delay || '0'}m</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Score</p>
          <p className="font-semibold text-aero-accent">{(plan.score || 0).toFixed(2)}</p>
        </div>
      </div>

      {plan.reasoning && (
        <div className="mt-3 p-2 bg-aero-dark rounded text-xs text-gray-300 border-l-2 border-aero-accent">
          {plan.reasoning.substring(0, 100)}...
        </div>
      )}
    </div>
  );
}
```

---

## Task 11: Create frontend/src/components/GanttTimeline.jsx

**Files:**
- Create: `frontend/src/components/GanttTimeline.jsx`

**Step 1: Create Gantt timeline visualization**

Create `frontend/src/components/GanttTimeline.jsx`:

```jsx
import React from 'react';

const COLORS = {
  'Boarding': '#3b82f6',
  'Cleaning': '#8b5cf6',
  'Fueling': '#ec4899',
  'Catering': '#f59e0b',
  'Loading': '#10b981',
  'Unloading': '#06b6d4',
  'Maintenance': '#ef4444',
  'Safety Check': '#6366f1',
};

export default function GanttTimeline({ plan }) {
  if (!plan?.task_timeline || plan.task_timeline.length === 0) {
    return <div className="text-gray-400">No tasks available</div>;
  }

  const maxTime = Math.max(...plan.task_timeline.map(t => t.end_minute || 0), 120);
  const timelineWidth = 800;
  const pixelsPerMinute = timelineWidth / maxTime;

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg p-6 overflow-x-auto">
      <div className="min-w-max">
        {/* Time axis */}
        <div className="flex items-end mb-8">
          <div className="w-32 flex-shrink-0" />
          <div className="relative" style={{ width: `${timelineWidth}px`, height: '24px' }}>
            {Array.from({ length: Math.ceil(maxTime / 30) + 1 }).map((_, i) => {
              const time = i * 30;
              const x = time * pixelsPerMinute;
              return (
                <div
                  key={i}
                  className="absolute text-xs text-gray-400"
                  style={{ left: `${x}px`, top: '8px' }}
                >
                  {time}m
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        {plan.task_timeline.map((task) => {
          const startX = (task.start_minute || 0) * pixelsPerMinute;
          const width = Math.max((task.end_minute - task.start_minute) * pixelsPerMinute, 60);
          const color = COLORS[task.task_type] || '#6b7280';

          return (
            <div key={task.task_id} className="flex items-center mb-4">
              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-medium text-white truncate">{task.task_name}</p>
                <p className="text-xs text-gray-400">{task.start_minute}m - {task.end_minute}m</p>
              </div>
              <div className="relative flex-grow" style={{ width: `${timelineWidth}px`, height: '40px' }}>
                <div
                  className="absolute h-10 rounded flex items-center px-2 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    left: `${startX}px`,
                    width: `${width}px`,
                    backgroundColor: color + '44',
                    border: `2px solid ${color}`,
                  }}
                  title={`${task.task_name}: ${task.start_minute}m - ${task.end_minute}m (${task.end_minute - task.start_minute}m)`}
                >
                  <span className="text-xs font-semibold text-white truncate">
                    {task.duration_minutes}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Task 12: Create frontend/src/components/ComparisonTable.jsx

**Files:**
- Create: `frontend/src/components/ComparisonTable.jsx`

**Step 1: Create comparison table with highlights**

Create `frontend/src/components/ComparisonTable.jsx`:

```jsx
import React from 'react';

export default function ComparisonTable({ plans, selectedPlanId }) {
  if (!plans || plans.length === 0) {
    return <div className="text-gray-400">No plans to compare</div>;
  }

  const metrics = [
    { key: 'turnaround_time', label: 'Turnaround Time', suffix: 'm', lower: true },
    { key: 'total_delay', label: 'Total Delay', suffix: 'm', lower: true },
    { key: 'score', label: 'K2 Score', suffix: '', lower: false },
    { key: 'resource_utilization', label: 'Resource Util.', suffix: '%', lower: false },
  ];

  // Find best values for highlighting
  const getBestValue = (metric) => {
    const values = plans.map(p => p[metric.key]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return metric.lower ? Math.min(...values) : Math.max(...values);
  };

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-aero-dark border-b border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-300">Plan</th>
            {metrics.map(m => (
              <th key={m.key} className="px-4 py-3 text-right font-semibold text-gray-300">
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.plan_id;
            return (
              <tr
                key={plan.plan_id}
                className={`border-b border-gray-700 ${isSelected ? 'bg-aero-accent/10' : 'hover:bg-aero-dark/50'}`}
              >
                <td className="px-4 py-3 font-medium text-white">
                  {plan.plan_id}
                  {isSelected && <span className="text-aero-accent ml-2">✓</span>}
                </td>
                {metrics.map((m) => {
                  const value = plan[m.key];
                  const bestValue = getBestValue(m);
                  const isBest = value === bestValue && bestValue !== null;
                  const displayValue = value !== null && value !== undefined
                    ? typeof value === 'number' ? value.toFixed(2) : value
                    : 'N/A';

                  return (
                    <td
                      key={m.key}
                      className={`px-4 py-3 text-right ${
                        isBest ? 'bg-green-900/30 text-green-300 font-semibold' : 'text-gray-300'
                      }`}
                    >
                      {displayValue}{m.suffix}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Task 13: Create frontend/src/components/ExplainabilityPanel.jsx

**Files:**
- Create: `frontend/src/components/ExplainabilityPanel.jsx`

**Step 1: Create explainability panel with tabs**

Create `frontend/src/components/ExplainabilityPanel.jsx`:

```jsx
import React, { useState } from 'react';

export default function ExplainabilityPanel({ plan, k2Selection, allPlans }) {
  const [activeTab, setActiveTab] = useState('justification');

  const tabs = [
    { id: 'justification', label: 'K2 Justification' },
    { id: 'comparison', label: 'AI vs Optimizer' },
    { id: 'details', label: 'Plan Details' },
  ];

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-aero-dark">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-aero-accent border-b-2 border-aero-accent'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 min-h-64">
        {activeTab === 'justification' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-3">Why K2 Recommends This Plan</h3>
            {k2Selection?.reasoning ? (
              <p className="text-gray-300 leading-relaxed text-sm">{k2Selection.reasoning}</p>
            ) : (
              <p className="text-gray-400 text-sm">No justification available</p>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-3">AI vs Optimizer Analysis</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">K2 Selection</p>
                <p className="font-semibold text-aero-accent">{k2Selection?.plan_id}</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Comparison Factor</p>
                <p className="font-semibold text-white">
                  {allPlans.length > 1 ? `+${((k2Selection?.score - Math.min(...allPlans.map(p => p.score))).toFixed(2))}% improvement` : 'Single plan'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Turnaround Time</p>
                <p className="font-semibold text-white">{plan?.turnaround_time || 'N/A'}m</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Total Delay</p>
                <p className="font-semibold text-white">{plan?.total_delay || '0'}m</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Score</p>
                <p className="font-semibold text-aero-accent">{(plan?.score || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Resource Util.</p>
                <p className="font-semibold text-white">{(plan?.resource_utilization || 0).toFixed(0)}%</p>
              </div>
            </div>
            {plan?.task_timeline && (
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-2">Tasks ({plan.task_timeline.length})</p>
                <div className="space-y-1">
                  {plan.task_timeline.slice(0, 5).map(t => (
                    <p key={t.task_id} className="text-xs text-gray-300">
                      • {t.task_name} ({t.duration_minutes}m)
                    </p>
                  ))}
                  {plan.task_timeline.length > 5 && (
                    <p className="text-xs text-gray-500">+ {plan.task_timeline.length - 5} more tasks</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 14: Create frontend/src/components/OptimizationStatus.jsx

**Files:**
- Create: `frontend/src/components/OptimizationStatus.jsx`

**Step 1: Create loading state indicator**

Create `frontend/src/components/OptimizationStatus.jsx`:

```jsx
import React from 'react';

export default function OptimizationStatus() {
  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg p-8 text-center">
      <div className="inline-block mb-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-aero-accent rounded-full animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Optimizing...</h3>
      <p className="text-gray-400 text-sm">K2 is analyzing scenarios and generating plans. This may take a moment.</p>
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-aero-accent rounded-full animate-pulse" />
          <span>Generating scenarios</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-aero-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span>Running K2 analysis</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-aero-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          <span>Computing metrics</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 15: Create frontend/.gitignore

**Files:**
- Create: `frontend/.gitignore`

**Step 1: Create gitignore file**

Create `frontend/.gitignore`:

```
# Vite
dist/
dist-ssr/
.vite/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
coverage/
*.tsbuildinfo
```

---

## Summary

This plan creates all 15 essential files for the Vite + React application:

1. **Config Files** (Tasks 1-2): vite.config.js, tailwind.config.js, postcss.config.js
2. **Entry Points** (Tasks 3-4): index.html, main.jsx, index.css
3. **Core App** (Tasks 5-6): API service, App.jsx, AppContext
4. **Pages** (Tasks 7-8): LandingPage, SimulationPage
5. **Components** (Tasks 9-14): ScenarioPanel, PlanCard, GanttTimeline, ComparisonTable, ExplainabilityPanel, OptimizationStatus
6. **Maintenance** (Task 15): .gitignore

All files use Tailwind CSS with aero-logic theme colors, proper React patterns, and integrate with the existing GateDiagram component.

