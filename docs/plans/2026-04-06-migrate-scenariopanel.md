# Migrate ScenarioPanel Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the ScenarioPanel component to use Zustand state management and full TypeScript.

**Architecture:** The component will be a client-side React component that interacts with the `useOptimizationStore`. It will handle initialization of default values, form inputs for scenario configuration, and triggering the optimization process.

**Tech Stack:** Next.js, React, Zustand, TypeScript, Tailwind CSS.

---

### Task 1: Create ScenarioPanel component structure

**Files:**
- Create: `frontend/src/components/client/ScenarioPanel.tsx`

**Step 1: Write initial component boilerplate**

```tsx
'use client'

import React, { useEffect } from 'react'
import { useOptimizationStore } from '@/store/optimizationStore'
import { WEATHER_CONDITIONS } from '@/utils/constants'

export const ScenarioPanel: React.FC = () => {
  const {
    config,
    selectedAircraft,
    selectedGate,
    weatherCondition,
    groundPowerAvailable,
    isLoading,
    error,
    setSelectedAircraft,
    setSelectedGate,
    setWeatherCondition,
    setGroundPowerAvailable,
    optimizeScenario,
  } = useOptimizationStore()

  // Initialize defaults if not set
  useEffect(() => {
    if (config) {
      if (!selectedAircraft && config.aircraft.length > 0) {
        setSelectedAircraft(config.aircraft[0].id)
      }
      if (!selectedGate && config.gates.length > 0) {
        setSelectedGate(config.gates[0])
      }
      if (!weatherCondition && WEATHER_CONDITIONS.length > 0) {
        setWeatherCondition(WEATHER_CONDITIONS[0])
      }
    }
  }, [config, selectedAircraft, selectedGate, weatherCondition, setSelectedAircraft, setSelectedGate, setWeatherCondition])

  if (!config) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Scenario Configuration</h2>
      
      <div className="space-y-6">
        {/* Aircraft Selection */}
        <div>
          <label htmlFor="aircraft" className="block text-sm font-medium text-gray-700 mb-1">
            Aircraft Type
          </label>
          <select
            id="aircraft"
            value={selectedAircraft}
            onChange={(e) => setSelectedAircraft(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            {config.aircraft.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Gate Selection */}
        <div>
          <label htmlFor="gate" className="block text-sm font-medium text-gray-700 mb-1">
            Gate Assignment
          </label>
          <select
            id="gate"
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            {config.gates.map((gate) => (
              <option key={gate} value={gate}>
                {gate}
              </option>
            ))}
          </select>
        </div>

        {/* Weather Selection */}
        <div>
          <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-1">
            Weather Condition
          </label>
          <select
            id="weather"
            value={weatherCondition?.condition || ''}
            onChange={(e) => {
              const condition = WEATHER_CONDITIONS.find(w => w.condition === e.target.value)
              if (condition) setWeatherCondition(condition)
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            {WEATHER_CONDITIONS.map((w) => (
              <option key={w.condition} value={w.condition}>
                {w.condition.charAt(0).toUpperCase() + w.condition.slice(1)} ({w.temperature}°C, {w.windSpeed} kn)
              </option>
            ))}
          </select>
        </div>

        {/* Ground Power Toggle */}
        <div className="flex items-center">
          <input
            id="groundPower"
            type="checkbox"
            checked={groundPowerAvailable}
            onChange={(e) => setGroundPowerAvailable(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="groundPower" className="ml-2 block text-sm text-gray-900">
            Ground Power Available
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => optimizeScenario()}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors
            ${isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-sm'}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Optimization...
            </span>
          ) : (
            'Generate Optimization'
          )}
        </button>
      </div>
    </div>
  )
}

export default ScenarioPanel
```

**Step 2: Commit**

```bash
git add frontend/src/components/client/ScenarioPanel.tsx
git commit -m "feat: migrate ScenarioPanel component with Zustand integration"
```
