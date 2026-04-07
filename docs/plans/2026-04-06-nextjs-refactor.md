# Next.js + Zustand Refactoring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Migrate the Aero-Logic frontend from Vite + React to Next.js App Router with Zustand state management and full TypeScript adoption.

**Architecture:** Next.js 14+ with App Router for file-based routing, Zustand for centralized state management eliminating prop drilling, TypeScript for type safety across all components, and Tailwind CSS for styling consistency.

**Tech Stack:** 
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+
- Zustand (state management)
- Tailwind CSS 3.4+
- Vitest (testing)

---

## Task 1: Setup New Next.js Project

**Files:**
- Create: `package.json` (Next.js template)
- Create: `tsconfig.json` (TypeScript config)
- Create: `next.config.js` (Next.js config)
- Create: `tailwind.config.ts` (Tailwind config)
- Create: `postcss.config.js` (PostCSS config)

**Step 1: Create new Next.js project with App Router and TypeScript**

```bash
npx create-next-app@latest . --typescript --app --tailwind --eslint --no-git
```

Expected output: Project scaffolded with Next.js App Router, TypeScript, Tailwind CSS

**Step 2: Update package.json with required dependencies**

Add to `package.json` dependencies:
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.4.7",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "tailwindcss": "^3.4.10",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.20",
    "vitest": "^4.1.2",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

**Step 3: Run npm install**

```bash
npm install
```

Expected output: All dependencies installed successfully

**Step 4: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.js tailwind.config.ts postcss.config.js
git commit -m "init: setup Next.js project with TypeScript and Tailwind"
```

---

## Task 2: Create TypeScript Types and Interfaces

**Files:**
- Create: `src/store/types.ts`

**Step 1: Write comprehensive TypeScript types file**

```typescript
// src/store/types.ts

// Configuration types
export interface WeatherCondition {
  condition: 'clear' | 'rain' | 'fog' | 'snow'
  temperature: number
  windSpeed: number
}

export interface Aircraft {
  id: string
  name: string
  taskTemplate: string[]
}

export interface Config {
  aircraft: Aircraft[]
  weatherConditions: WeatherCondition[]
  disruptions: string[]
  gates: string[]
}

// Task types
export interface Task {
  id: string
  name: string
  duration: number
  category: 'passenger' | 'fuel' | 'service' | 'cargo' | 'safety'
  resources: string[]
  startTime?: number
  endTime?: number
  status?: 'pending' | 'in_progress' | 'completed'
}

export interface Disruption {
  id: string
  name: string
  affectedTasks: string[]
  delayMinutes: number
  description: string
}

// Scenario types
export interface Scenario {
  id: string
  aircraftType: string
  gate: string
  scheduledDeparture: string
  weather: WeatherCondition
  groundPowerAvailable: boolean
  tasks: Task[]
  disruptions: Disruption[]
}

// Plan types
export interface Plan {
  id: 'A' | 'B' | 'C'
  name: string
  tasks: Task[]
  metrics: PlanMetrics
  reasoning: string
  isRecommended: boolean
}

export interface PlanMetrics {
  totalDelay: number
  apuUsage: number
  turnaroundTime: number
  onTimeProbability: number
  fuelCost: number
}

export interface ComparisonMetrics {
  delayComparison: Record<string, number>
  apuComparison: Record<string, number>
  insights: string[]
}

// K2 Reasoning types
export interface K2ReasoningData {
  justification: string
  tradeoffAnalysis: string
  agreementWithOptimizer: boolean
  reasoning: ReasoningStep[]
}

export interface ReasoningStep {
  step: number
  phase: string
  description: string
  duration: number
}

// Results types
export interface OptimizationResults {
  scenarioId: string
  timestamp: string
  plans: Plan[]
  comparison: ComparisonMetrics
  k2Reasoning: K2ReasoningData
  delayBreakdown: DelayBreakdown
}

export interface DelayBreakdown {
  original: DelayImpact[]
  planA: DelayImpact[]
  planB: DelayImpact[]
  planC: DelayImpact[]
}

export interface DelayImpact {
  taskId: string
  taskName: string
  delayMinutes: number
  reason: string
  severity: 'on-time' | 'slight' | 'significant'
}

// Store state types
export interface OptimizationStoreState {
  // Configuration
  config: Config | null
  
  // User Inputs
  scenario: Scenario | null
  selectedAircraft: string
  selectedGate: string
  weatherCondition: WeatherCondition | null
  disruptions: Disruption[]
  groundPowerAvailable: boolean
  
  // Results
  results: OptimizationResults | null
  selectedPlanId: 'A' | 'B' | 'C' | null
  
  // UI State
  isLoading: boolean
  error: string | null
  simulationStep: number
  currentPage: 'landing' | 'optimize'
  
  // Actions
  setConfig: (config: Config) => void
  setScenario: (scenario: Scenario) => void
  setSelectedAircraft: (aircraftId: string) => void
  setSelectedGate: (gate: string) => void
  setWeatherCondition: (weather: WeatherCondition) => void
  setDisruptions: (disruptions: Disruption[]) => void
  setGroundPowerAvailable: (available: boolean) => void
  setResults: (results: OptimizationResults) => void
  setSelectedPlan: (planId: 'A' | 'B' | 'C') => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSimulationStep: (step: number) => void
  setCurrentPage: (page: 'landing' | 'optimize') => void
  resetState: () => void
  resetResults: () => void
  
  // Async actions
  loadConfig: () => Promise<void>
  optimizeScenario: () => Promise<void>
}
```

**Step 2: Commit**

```bash
git add src/store/types.ts
git commit -m "feat: add comprehensive TypeScript types and interfaces"
```

---

## Task 3: Create Zustand Store

**Files:**
- Create: `src/store/optimizationStore.ts`

**Step 1: Write Zustand store with all state and actions**

```typescript
// src/store/optimizationStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { OptimizationStoreState, Config, Scenario, OptimizationResults, Disruption, WeatherCondition } from './types'
import { apiClient } from '@/services/api'

const initialState = {
  config: null,
  scenario: null,
  selectedAircraft: '',
  selectedGate: '',
  weatherCondition: null,
  disruptions: [],
  groundPowerAvailable: false,
  results: null,
  selectedPlanId: null as 'A' | 'B' | 'C' | null,
  isLoading: false,
  error: null,
  simulationStep: 0,
  currentPage: 'landing' as const,
}

export const useOptimizationStore = create<OptimizationStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Configuration actions
      setConfig: (config: Config) => set({ config }),

      // Scenario actions
      setScenario: (scenario: Scenario) => set({ scenario }),
      setSelectedAircraft: (aircraftId: string) => set({ selectedAircraft: aircraftId }),
      setSelectedGate: (gate: string) => set({ selectedGate: gate }),
      setWeatherCondition: (weather: WeatherCondition) => set({ weatherCondition: weather }),
      setDisruptions: (disruptions: Disruption[]) => set({ disruptions }),
      setGroundPowerAvailable: (available: boolean) => set({ groundPowerAvailable: available }),

      // Results actions
      setResults: (results: OptimizationResults) => set({ results, selectedPlanId: 'A' }),
      setSelectedPlan: (planId: 'A' | 'B' | 'C') => set({ selectedPlanId: planId }),

      // UI state actions
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setSimulationStep: (step: number) => set({ simulationStep: step }),
      setCurrentPage: (page: 'landing' | 'optimize') => set({ currentPage: page }),

      // Reset actions
      resetState: () => set(initialState),
      resetResults: () => set({ results: null, selectedPlanId: null, simulationStep: 0 }),

      // Async actions
      loadConfig: async () => {
        set({ isLoading: true, error: null })
        try {
          const config = await apiClient.getConfig()
          set({ config })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load configuration'
          set({ error: message })
        } finally {
          set({ isLoading: false })
        }
      },

      optimizeScenario: async () => {
        const { scenario } = get()
        if (!scenario) {
          set({ error: 'No scenario defined' })
          return
        }

        set({ isLoading: true, error: null, simulationStep: 1 })
        try {
          // Simulate steps
          for (let step = 1; step <= 8; step++) {
            await new Promise(resolve => setTimeout(resolve, 300))
            set({ simulationStep: step })
          }

          // Call API
          const results = await apiClient.optimize(scenario)
          set({ results, selectedPlanId: 'A', simulationStep: 9 })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Optimization failed'
          set({ error: message })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    { name: 'OptimizationStore' }
  )
)
```

**Step 2: Commit**

```bash
git add src/store/optimizationStore.ts
git commit -m "feat: create Zustand store for optimization state management"
```

---

## Task 4: Create API Service Layer

**Files:**
- Create: `src/services/api.ts`

**Step 1: Write typed API client**

```typescript
// src/services/api.ts

import axios, { AxiosInstance } from 'axios'
import type { Config, Scenario, OptimizationResults } from '@/store/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aero-logic.onrender.com/api'

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      response => response,
      error => {
        const message = error.response?.data?.message || error.message || 'An error occurred'
        return Promise.reject(new Error(message))
      }
    )
  }

  async getConfig(): Promise<Config> {
    const { data } = await this.instance.get<Config>('/config')
    return data
  }

  async generateScenario(aircraftType: string): Promise<Scenario> {
    const { data } = await this.instance.post<Scenario>('/scenario/generate', {
      aircraftType,
    })
    return data
  }

  async generateDisruption(scenarioId: string, disruptionType: string): Promise<Scenario> {
    const { data } = await this.instance.post<Scenario>('/scenario/disruption', {
      scenarioId,
      disruptionType,
    })
    return data
  }

  async optimize(scenario: Scenario): Promise<OptimizationResults> {
    const { data } = await this.instance.post<OptimizationResults>('/optimize', scenario)
    return data
  }

  async generateRandom(): Promise<Scenario> {
    const { data } = await this.instance.get<Scenario>('/scenario/random')
    return data
  }
}

export const apiClient = new ApiClient()
```

**Step 2: Create environment configuration file**

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Create `.env.example`:
```
NEXT_PUBLIC_API_URL=https://aero-logic.onrender.com/api
```

**Step 3: Commit**

```bash
git add src/services/api.ts .env.local .env.example
git commit -m "feat: create typed API service layer with axios"
```

---

## Task 5: Migrate Utility Functions to TypeScript

**Files:**
- Create: `src/utils/delayCalculator.ts`
- Create: `src/utils/gateLayoutEngine.ts`
- Create: `src/utils/constants.ts`

**Step 1: Migrate delayCalculator with TypeScript**

```typescript
// src/utils/delayCalculator.ts

import type { Task, DelayImpact } from '@/store/types'

export interface DelaySeverity {
  level: 'on-time' | 'slight' | 'significant'
  delayMinutes: number
}

export const calculateDelayCascade = (tasks: Task[]): DelayImpact[] => {
  const impacts: DelayImpact[] = []
  let cumulativeDelay = 0

  tasks.forEach((task, index) => {
    const taskDelay = task.duration * (Math.random() * 0.2) // Simulate variance
    cumulativeDelay += taskDelay

    impacts.push({
      taskId: task.id,
      taskName: task.name,
      delayMinutes: Math.round(cumulativeDelay),
      reason: `Cumulative delay from task sequence`,
      severity: getDelaySeverity(Math.round(cumulativeDelay)).level,
    })
  })

  return impacts
}

export const getDelaySeverity = (delayMinutes: number): DelaySeverity => {
  if (delayMinutes === 0) {
    return { level: 'on-time', delayMinutes: 0 }
  } else if (delayMinutes <= 15) {
    return { level: 'slight', delayMinutes }
  } else {
    return { level: 'significant', delayMinutes }
  }
}

export const getDelayIndicator = (severity: 'on-time' | 'slight' | 'significant'): {
  emoji: string
  color: string
  label: string
} => {
  const indicators = {
    'on-time': { emoji: '✅', color: '#10b981', label: 'On Time' },
    slight: { emoji: '⚠️', color: '#f59e0b', label: 'Slight Delay' },
    significant: { emoji: '❌', color: '#ef4444', label: 'Significant Delay' },
  }
  return indicators[severity]
}
```

**Step 2: Migrate gateLayoutEngine with TypeScript**

```typescript
// src/utils/gateLayoutEngine.ts

import type { Task } from '@/store/types'

export const TASK_CATEGORIES = {
  passenger: { color: '#3b82f6', label: 'Passenger' },
  fuel: { color: '#10b981', label: 'Fuel' },
  service: { color: '#f59e0b', label: 'Service' },
  cargo: { color: '#8b5cf6', label: 'Cargo' },
  safety: { color: '#ef4444', label: 'Safety' },
} as const

export interface TaskLayout {
  taskId: string
  x: number
  y: number
  width: number
  height: number
  color: string
  label: string
  startTime: number
  endTime: number
}

export const calculateLayout = (tasks: Task[], containerWidth: number = 800): TaskLayout[] => {
  const lanes = 5
  const laneHeight = containerWidth / lanes
  const timelineWidth = containerWidth

  return tasks.map((task, index) => {
    const lane = index % lanes
    const category = task.category as keyof typeof TASK_CATEGORIES
    const color = TASK_CATEGORIES[category]?.color || '#6b7280'

    return {
      taskId: task.id,
      x: (task.startTime || 0) * (timelineWidth / 480),
      y: lane * laneHeight,
      width: (task.duration || 30) * (timelineWidth / 480),
      height: laneHeight - 8,
      color,
      label: task.name,
      startTime: task.startTime || 0,
      endTime: (task.startTime || 0) + (task.duration || 30),
    }
  })
}

export const getTaskColor = (category: Task['category']): string => {
  return TASK_CATEGORIES[category]?.color || '#6b7280'
}
```

**Step 3: Create constants file**

```typescript
// src/utils/constants.ts

export const PREDEFINED_TASKS = [
  { id: 'refuel', name: 'Refueling', duration: 45, category: 'fuel' as const },
  { id: 'cargo_unload', name: 'Cargo Unload', duration: 30, category: 'cargo' as const },
  { id: 'cargo_load', name: 'Cargo Load', duration: 30, category: 'cargo' as const },
  { id: 'boarding', name: 'Passenger Boarding', duration: 40, category: 'passenger' as const },
  { id: 'catering', name: 'Catering', duration: 25, category: 'service' as const },
  { id: 'cleaning', name: 'Aircraft Cleaning', duration: 35, category: 'service' as const },
  { id: 'inspection', name: 'Safety Inspection', duration: 20, category: 'safety' as const },
  { id: 'deice', name: 'De-ice/Anti-ice', duration: 30, category: 'safety' as const },
  { id: 'ground_power', name: 'Ground Power/Cooling', duration: 15, category: 'fuel' as const },
  { id: 'door_closure', name: 'Door Closure & Safety', duration: 10, category: 'safety' as const },
]

export const AIRCRAFT_PRESETS = {
  a320_standard: {
    name: 'Airbus A320',
    tasks: ['refuel', 'boarding', 'catering', 'cleaning', 'inspection', 'cargo_load', 'door_closure', 'ground_power'],
  },
  b787_standard: {
    name: 'Boeing 787',
    tasks: ['refuel', 'cargo_unload', 'cargo_load', 'boarding', 'catering', 'cleaning', 'inspection', 'deice', 'door_closure'],
  },
  regional_basic: {
    name: 'Regional Aircraft',
    tasks: ['refuel', 'boarding', 'cleaning', 'inspection', 'door_closure'],
  },
}

export const SIMULATION_STEPS = [
  'Initializing scenario...',
  'Loading aircraft configuration...',
  'Analyzing current constraints...',
  'Generating alternative plans...',
  'Evaluating plan A metrics...',
  'Evaluating plan B metrics...',
  'Evaluating plan C metrics...',
  'Finalizing recommendations...',
]

export const WEATHER_CONDITIONS = [
  { condition: 'clear' as const, temperature: 25, windSpeed: 5 },
  { condition: 'rain' as const, temperature: 20, windSpeed: 15 },
  { condition: 'fog' as const, temperature: 15, windSpeed: 8 },
  { condition: 'snow' as const, temperature: -5, windSpeed: 20 },
]
```

**Step 4: Commit**

```bash
git add src/utils/
git commit -m "feat: migrate utilities to TypeScript with full type safety"
```

---

## Task 6: Create Client-Side Providers and Root Layout

**Files:**
- Create: `src/lib/providers.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css`

**Step 1: Create providers component for client-side context**

```typescript
// src/lib/providers.tsx

'use client'

import React from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <>{children}</>
}
```

**Step 2: Update root layout**

```typescript
// src/app/layout.tsx

import type { Metadata } from 'next'
import { Providers } from '@/lib/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aero-Logic | AI-Powered Aircraft Optimization',
  description: 'Optimize aircraft turnaround times with AI-powered planning',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-aero-dark to-aero-card text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Step 3: Create globals.css with Tailwind and custom styles**

```css
/* src/app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(10, 22, 40, 0.5);
  }

  ::-webkit-scrollbar-thumb {
    background: #00d4ff;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #00b8d4;
  }
}

@layer components {
  .fade-in {
    @apply animate-fade-in;
  }

  .slide-in-up {
    @apply animate-slide-in-up;
  }

  .btn-primary {
    @apply px-6 py-3 bg-aero-accent text-aero-dark font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-200;
  }

  .btn-secondary {
    @apply px-6 py-3 bg-aero-card border border-aero-accent text-aero-accent font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-200;
  }

  .card-container {
    @apply bg-gradient-to-br from-aero-card to-aero-dark border border-aero-accent/20 rounded-xl p-6 shadow-lg;
  }
}

@layer utilities {
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slide-in-up {
    animation: slideInUp 0.5s ease-out;
  }
}
```

**Step 4: Update tailwind.config.ts**

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aero-dark': '#0a1628',
        'aero-card': '#12243d',
        'aero-accent': '#00d4ff',
        'aero-success': '#10b981',
        'aero-warning': '#f59e0b',
        'aero-danger': '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

**Step 5: Commit**

```bash
git add src/lib/providers.tsx src/app/layout.tsx src/app/globals.css tailwind.config.ts
git commit -m "feat: setup root layout, providers, and styling"
```

---

## Task 7: Create Landing Page (Server Component)

**Files:**
- Create: `src/app/page.tsx`

**Step 1: Create landing page**

```typescript
// src/app/page.tsx

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-aero-dark to-aero-card">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered Aircraft <span className="text-aero-accent">Optimization</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Reduce turnaround times, optimize gate operations, and improve on-time performance with Aero-Logic's K2-powered optimization engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/optimize"
                className="btn-primary inline-block text-lg"
              >
                Get Started
              </Link>
              <button className="btn-secondary inline-block text-lg">
                Learn More
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: 'Multi-Plan Generation',
                description: 'Generate multiple optimization scenarios (A, B, C) for comparison and analysis.',
                icon: '📊',
              },
              {
                title: 'Explainable AI',
                description: 'K2 Think provides transparent reasoning for every recommendation.',
                icon: '🧠',
              },
              {
                title: 'Real-Time Simulation',
                description: 'Interactive gate diagrams show task execution and delay cascades in real-time.',
                icon: '⚡',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card-container text-center hover:border-aero-accent/50 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Define Scenario', desc: 'Select aircraft, disruptions, weather' },
              { step: 2, title: 'Generate Plans', desc: 'AI creates alternative scenarios' },
              { step: 3, title: 'Compare Metrics', desc: 'Analyze delay, cost, on-time probability' },
              { step: 4, title: 'Execute', desc: 'Implement recommended plan' },
            ].map((item) => (
              <div key={item.step} className="card-container text-center">
                <div className="w-12 h-12 bg-aero-accent rounded-full flex items-center justify-center text-aero-dark font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center card-container">
          <h2 className="text-4xl font-bold mb-6">Ready to Optimize?</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Start using Aero-Logic to reduce turnaround times and improve operational efficiency.
          </p>
          <Link href="/optimize" className="btn-primary inline-block text-lg">
            Launch Optimization Tool
          </Link>
        </div>
      </section>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: create landing page with marketing content"
```

---

## Task 8: Create Optimization Workflow Page and Client Components Directory

**Files:**
- Create: `src/app/optimize/page.tsx`
- Create: `src/components/client/` directory structure

**Step 1: Create optimization page (layout shell)**

```typescript
// src/app/optimize/page.tsx

'use client'

import { useEffect } from 'react'
import { useOptimizationStore } from '@/store/optimizationStore'
import ScenarioPanel from '@/components/client/ScenarioPanel'
import OptimizationStatus from '@/components/client/OptimizationStatus'
import PlanCards from '@/components/client/PlanCards'
import ComparisonTable from '@/components/client/ComparisonTable'
import GanttTimeline from '@/components/client/GanttTimeline'
import ExplainabilityPanel from '@/components/client/ExplainabilityPanel'
import GateDiagram from '@/components/client/GateDiagram'

export default function OptimizationPage() {
  const { config, loadConfig, currentPage, setCurrentPage, results } = useOptimizationStore()

  useEffect(() => {
    if (!config) {
      loadConfig()
    }
    setCurrentPage('optimize')
  }, [config, loadConfig, setCurrentPage])

  return (
    <main className="min-h-screen bg-gradient-to-br from-aero-dark to-aero-card p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Aircraft Optimization</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Input */}
          <div className="lg:col-span-1">
            <ScenarioPanel />
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            <OptimizationStatus />

            {results && (
              <>
                <div className="card-container">
                  <h2 className="text-2xl font-bold mb-4">Optimization Plans</h2>
                  <PlanCards />
                </div>

                <div className="card-container">
                  <h2 className="text-2xl font-bold mb-4">Plan Comparison</h2>
                  <ComparisonTable />
                </div>

                <div className="card-container">
                  <h2 className="text-2xl font-bold mb-4">Timeline Visualization</h2>
                  <GanttTimeline />
                </div>

                <div className="card-container">
                  <h2 className="text-2xl font-bold mb-4">Gate Diagram</h2>
                  <GateDiagram />
                </div>

                <div className="card-container">
                  <h2 className="text-2xl font-bold mb-4">Explainability</h2>
                  <ExplainabilityPanel />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/optimize/page.tsx
git commit -m "feat: create optimization page shell"
```

---

## Task 9: Migrate ScenarioPanel Component

**Files:**
- Create: `src/components/client/ScenarioPanel.tsx`

**Step 1: Create ScenarioPanel component**

```typescript
// src/components/client/ScenarioPanel.tsx

'use client'

import { useEffect, useState } from 'react'
import { useOptimizationStore } from '@/store/optimizationStore'
import type { Config, WeatherCondition } from '@/store/types'
import { AIRCRAFT_PRESETS, WEATHER_CONDITIONS } from '@/utils/constants'

export default function ScenarioPanel() {
  const {
    config,
    selectedAircraft,
    selectedGate,
    weatherCondition,
    groundPowerAvailable,
    disruptions,
    setSelectedAircraft,
    setSelectedGate,
    setWeatherCondition,
    setGroundPowerAvailable,
    setDisruptions,
    optimizeScenario,
    isLoading,
    error,
  } = useOptimizationStore()

  const [gates, setGates] = useState<string[]>([])

  useEffect(() => {
    if (config) {
      setGates(config.gates || ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
      if (!selectedAircraft) {
        setSelectedAircraft(config.aircraft[0]?.id || 'a320_standard')
      }
      if (!selectedGate) {
        setSelectedGate(config.gates[0] || 'A1')
      }
      if (!weatherCondition) {
        setWeatherCondition(WEATHER_CONDITIONS[0])
      }
    }
  }, [config, selectedAircraft, selectedGate, weatherCondition, setSelectedAircraft, setSelectedGate, setWeatherCondition])

  const handleOptimize = async () => {
    await optimizeScenario()
  }

  if (!config) {
    return <div className="card-container">Loading configuration...</div>
  }

  return (
    <div className="card-container space-y-6">
      <h2 className="text-2xl font-bold">Scenario Configuration</h2>

      {/* Aircraft Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">Aircraft Type</label>
        <select
          value={selectedAircraft}
          onChange={(e) => setSelectedAircraft(e.target.value)}
          className="w-full px-4 py-2 bg-aero-dark border border-aero-accent/30 rounded-lg text-white focus:outline-none focus:border-aero-accent"
        >
          {config.aircraft.map((aircraft) => (
            <option key={aircraft.id} value={aircraft.id}>
              {aircraft.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gate Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">Gate Assignment</label>
        <select
          value={selectedGate}
          onChange={(e) => setSelectedGate(e.target.value)}
          className="w-full px-4 py-2 bg-aero-dark border border-aero-accent/30 rounded-lg text-white focus:outline-none focus:border-aero-accent"
        >
          {gates.map((gate) => (
            <option key={gate} value={gate}>
              {gate}
            </option>
          ))}
        </select>
      </div>

      {/* Weather Condition */}
      <div>
        <label className="block text-sm font-semibold mb-2">Weather Condition</label>
        <select
          value={weatherCondition?.condition || 'clear'}
          onChange={(e) => {
            const condition = WEATHER_CONDITIONS.find((w) => w.condition === e.target.value)
            if (condition) setWeatherCondition(condition)
          }}
          className="w-full px-4 py-2 bg-aero-dark border border-aero-accent/30 rounded-lg text-white focus:outline-none focus:border-aero-accent"
        >
          {WEATHER_CONDITIONS.map((weather) => (
            <option key={weather.condition} value={weather.condition}>
              {weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)} ({weather.temperature}°C)
            </option>
          ))}
        </select>
      </div>

      {/* Ground Power */}
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          id="groundPower"
          checked={groundPowerAvailable}
          onChange={(e) => setGroundPowerAvailable(e.target.checked)}
          className="w-5 h-5 accent-aero-accent cursor-pointer"
        />
        <label htmlFor="groundPower" className="cursor-pointer">
          Ground Power Available
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-aero-danger/20 border border-aero-danger rounded-lg text-aero-danger">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <button
        onClick={handleOptimize}
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Optimizing...' : 'Generate Optimization'}
      </button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/client/ScenarioPanel.tsx
git commit -m "feat: migrate ScenarioPanel component with Zustand integration"
```

---

## Task 10: Migrate OptimizationStatus Component

**Files:**
- Create: `src/components/client/OptimizationStatus.tsx`

**Step 1: Create OptimizationStatus component**

```typescript
// src/components/client/OptimizationStatus.tsx

'use client'

import { useOptimizationStore } from '@/store/optimizationStore'
import { SIMULATION_STEPS } from '@/utils/constants'

export default function OptimizationStatus() {
  const { simulationStep, isLoading, error } = useOptimizationStore()

  if (!isLoading && simulationStep === 0) {
    return null
  }

  return (
    <div className="card-container">
      {error ? (
        <div className="text-aero-danger">
          <h3 className="text-lg font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold mb-4">Optimization Progress</h3>
          <div className="space-y-3">
            {SIMULATION_STEPS.map((step, idx) => {
              const stepNumber = idx + 1
              const isCompleted = simulationStep > stepNumber
              const isCurrent = simulationStep === stepNumber

              return (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isCompleted ? 'bg-aero-success' : isCurrent ? 'bg-aero-accent' : 'bg-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <span className={isCurrent ? 'text-aero-accent font-semibold' : 'text-gray-400'}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/client/OptimizationStatus.tsx
git commit -m "feat: migrate OptimizationStatus component"
```

---

## Task 11: Migrate PlanCard and PlanCards Container

**Files:**
- Create: `src/components/client/PlanCard.tsx`
- Create: `src/components/client/PlanCards.tsx`

**Step 1: Create PlanCard component**

```typescript
// src/components/client/PlanCard.tsx

'use client'

import { useState } from 'react'
import { useOptimizationStore } from '@/store/optimizationStore'
import type { Plan } from '@/store/types'

interface PlanCardProps {
  plan: Plan
}

export default function PlanCard({ plan }: PlanCardProps) {
  const { selectedPlanId, setSelectedPlan } = useOptimizationStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const isSelected = selectedPlanId === plan.id

  return (
    <div
      onClick={() => setSelectedPlan(plan.id)}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-aero-accent/20 border-aero-accent' : 'bg-aero-dark border-aero-accent/30 hover:border-aero-accent/50'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">Plan {plan.id}</h3>
          {plan.isRecommended && <span className="text-sm text-aero-success font-semibold">✓ Recommended</span>}
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-aero-accent">
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Delay</p>
          <p className="text-2xl font-bold text-aero-accent">{plan.metrics.totalDelay}m</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">On-Time Prob.</p>
          <p className="text-2xl font-bold text-aero-success">{plan.metrics.onTimeProbability}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">APU Usage</p>
          <p className="text-2xl font-bold">{plan.metrics.apuUsage}h</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Turnaround</p>
          <p className="text-2xl font-bold">{plan.metrics.turnaroundTime}m</p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-aero-accent/20">
          <p className="text-gray-300 text-sm mb-3">{plan.reasoning}</p>
          <div>
            <p className="text-sm text-gray-400 mb-2">Tasks ({plan.tasks.length}):</p>
            <div className="flex flex-wrap gap-2">
              {plan.tasks.map((task) => (
                <span key={task.id} className="px-2 py-1 bg-aero-accent/20 rounded text-xs text-aero-accent">
                  {task.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create PlanCards container**

```typescript
// src/components/client/PlanCards.tsx

'use client'

import { useOptimizationStore } from '@/store/optimizationStore'
import PlanCard from './PlanCard'

export default function PlanCards() {
  const { results } = useOptimizationStore()

  if (!results) return null

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {results.plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/client/PlanCard.tsx src/components/client/PlanCards.tsx
git commit -m "feat: migrate plan card components with selection state"
```

---

## Task 12: Migrate ComparisonTable Component

**Files:**
- Create: `src/components/client/ComparisonTable.tsx`

**Step 1: Create ComparisonTable component**

```typescript
// src/components/client/ComparisonTable.tsx

'use client'

import { useOptimizationStore } from '@/store/optimizationStore'

export default function ComparisonTable() {
  const { results } = useOptimizationStore()

  if (!results) return null

  const plans = results.plans
  const metrics = [
    { label: 'Total Delay (minutes)', key: 'totalDelay' as const },
    { label: 'APU Usage (hours)', key: 'apuUsage' as const },
    { label: 'Turnaround Time (minutes)', key: 'turnaroundTime' as const },
    { label: 'On-Time Probability (%)', key: 'onTimeProbability' as const },
    { label: 'Fuel Cost ($)', key: 'fuelCost' as const },
  ]

  const getHighlightClass = (values: number[]) => {
    const minIndex = values.indexOf(Math.min(...values))
    return (idx: number) => (idx === minIndex ? 'text-aero-success font-bold' : '')
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-aero-accent/20">
            <th className="text-left py-3 px-4 font-semibold">Metric</th>
            {plans.map((plan) => (
              <th key={plan.id} className="text-center py-3 px-4 font-semibold">
                Plan {plan.id}
                {plan.isRecommended && <div className="text-xs text-aero-success">Recommended</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => {
            const values = plans.map((p) => p.metrics[metric.key])
            const highlightClass = getHighlightClass(values)

            return (
              <tr key={metric.key} className="border-b border-aero-accent/10 hover:bg-aero-accent/5">
                <td className="py-3 px-4 text-gray-300">{metric.label}</td>
                {values.map((value, idx) => (
                  <td key={idx} className={`text-center py-3 px-4 ${highlightClass(idx)}`}>
                    {typeof value === 'number' ? value.toFixed(metric.key === 'fuelCost' ? 2 : 0) : value}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Insights */}
      {results.comparison.insights.length > 0 && (
        <div className="mt-6 p-4 bg-aero-accent/10 rounded-lg border border-aero-accent/20">
          <h4 className="font-semibold mb-2 text-aero-accent">Key Insights</h4>
          <ul className="space-y-1">
            {results.comparison.insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/client/ComparisonTable.tsx
git commit -m "feat: migrate ComparisonTable with metrics highlighting"
```

---

## Task 13: Migrate GanttTimeline Component

**Files:**
- Create: `src/components/client/GanttTimeline.tsx`

**Step 1: Create GanttTimeline component**

```typescript
// src/components/client/GanttTimeline.tsx

'use client'

import { useOptimizationStore } from '@/store/optimizationStore'
import { calculateLayout } from '@/utils/gateLayoutEngine'

export default function GanttTimeline() {
  const { results, selectedPlanId } = useOptimizationStore()

  if (!results || !selectedPlanId) return null

  const plan = results.plans.find((p) => p.id === selectedPlanId)
  if (!plan) return null

  const layout = calculateLayout(plan.tasks, 800)
  const maxTime = Math.max(...plan.tasks.map((t) => (t.endTime || 0) + 30), 480)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Task Timeline - Plan {selectedPlanId}</h3>
        <span className="text-sm text-gray-400">Total: {maxTime} minutes</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 800 ${layout.length * 60 + 40}`} className="w-full border border-aero-accent/20 rounded-lg">
          {/* Grid lines */}
          {[0, 120, 240, 360, 480].map((time) => (
            <g key={`grid-${time}`}>
              <line x1={(time / maxTime) * 750 + 40} y1="20" x2={(time / maxTime) * 750 + 40} y2={layout.length * 60 + 20} stroke="#00d4ff" strokeDasharray="4" opacity="0.2" />
              <text x={(time / maxTime) * 750 + 40} y="15" textAnchor="middle" fill="#999" fontSize="12">
                {time}m
              </text>
            </g>
          ))}

          {/* Task bars */}
          {layout.map((task) => (
            <g key={task.taskId}>
              <rect
                x={(task.startTime / maxTime) * 750 + 40}
                y={task.y + 30}
                width={(task.width / maxTime) * 750}
                height={task.height}
                fill={task.color}
                opacity="0.8"
                rx="4"
              />
              <text
                x={(task.startTime / maxTime) * 750 + 50}
                y={task.y + 30 + task.height / 2 + 5}
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {task.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
        {Array.from(new Set(layout.map((t) => t.color))).map((color) => {
          const task = layout.find((t) => t.color === color)
          return (
            <div key={color} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-400">{task?.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/client/GanttTimeline.tsx
git commit -m "feat: migrate GanttTimeline component with SVG rendering"
```

---

## Task 14: Migrate ExplainabilityPanel Component

**Files:**
- Create: `src/components/client/ExplainabilityPanel.tsx`

**Step 1: Create ExplainabilityPanel component**

```typescript
// src/components/client/ExplainabilityPanel.tsx

'use client'

import { useState } from 'react'
import { useOptimizationStore } from '@/store/optimizationStore'

export default function ExplainabilityPanel() {
  const { results } = useOptimizationStore()
  const [activeTab, setActiveTab] = useState<'justification' | 'comparison'>('justification')

  if (!results) return null

  const { k2Reasoning } = results

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-aero-accent/20">
        <button
          onClick={() => setActiveTab('justification')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'justification' ? 'border-aero-accent text-aero-accent' : 'border-transparent text-gray-400'
          }`}
        >
          K2 Justification
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'comparison' ? 'border-aero-accent text-aero-accent' : 'border-transparent text-gray-400'
          }`}
        >
          AI vs Optimizer
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'justification' ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Main Reasoning</h4>
              <p className="text-gray-300">{k2Reasoning.justification}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Trade-off Analysis</h4>
              <p className="text-gray-300">{k2Reasoning.tradeoffAnalysis}</p>
            </div>

            {k2Reasoning.reasoning.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Reasoning Steps</h4>
                <div className="space-y-2">
                  {k2Reasoning.reasoning.map((step) => (
                    <div key={step.step} className="p-3 bg-aero-dark rounded-lg border border-aero-accent/20">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-aero-accent">Step {step.step}: {step.phase}</span>
                        <span className="text-xs text-gray-400">{step.duration}s</span>
                      </div>
                      <p className="text-sm text-gray-300">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                k2Reasoning.agreementWithOptimizer
                  ? 'bg-aero-success/10 border-aero-success'
                  : 'bg-aero-warning/10 border-aero-warning'
              }`}
            >
              <h4 className="font-semibold mb-2">
                {k2Reasoning.agreementWithOptimizer ? '✓ Aligned with Classical Optimizer' : '⚠ Differs from Classical Optimizer'}
              </h4>
              <p className="text-gray-300">
                {k2Reasoning.agreementWithOptimizer
                  ? 'K2 Think recommendations align with classical optimization methods.'
                  : 'K2 Think has identified a better solution by considering factors beyond traditional optimization.'}
              </p>
            </div>

            <div className="p-4 bg-aero-dark rounded-lg border border-aero-accent/20">
              <h4 className="font-semibold mb-2">Analysis</h4>
              <p className="text-gray-300 text-sm">{k2Reasoning.justification}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/client/ExplainabilityPanel.tsx
git commit -m "feat: migrate ExplainabilityPanel with tabbed interface"
```

---

## Task 15: Migrate GateDiagram Component (Complex Visualization)

**Files:**
- Create: `src/components/client/GateDiagram.tsx`

**Step 1: Create GateDiagram component**

```typescript
// src/components/client/GateDiagram.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { useOptimizationStore } from '@/store/optimizationStore'
import { calculateLayout } from '@/utils/gateLayoutEngine'
import { calculateDelayCascade } from '@/utils/delayCalculator'

export default function GateDiagram() {
  const { results, selectedPlanId } = useOptimizationStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)
  const animationRef = useRef<NodeJS.Timeout>()

  if (!results || !selectedPlanId) return null

  const plan = results.plans.find((p) => p.id === selectedPlanId)
  if (!plan) return null

  const layout = calculateLayout(plan.tasks, 800)
  const delays = calculateDelayCascade(plan.tasks)
  const maxSteps = plan.tasks.length

  // Animation loop
  useEffect(() => {
    if (isPlaying && currentStep < maxSteps) {
      animationRef.current = setTimeout(
        () => setCurrentStep((prev) => prev + 1),
        1000 / speed
      )
    } else if (currentStep >= maxSteps) {
      setIsPlaying(false)
    }

    return () => clearTimeout(animationRef.current)
  }, [isPlaying, currentStep, maxSteps, speed])

  const completedTasks = layout.slice(0, currentStep)
  const currentTask = layout[currentStep]

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-aero-dark rounded-lg">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-aero-accent text-aero-dark font-semibold rounded hover:bg-opacity-90 transition-all"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => {
            setCurrentStep(0)
            setIsPlaying(false)
          }}
          className="px-4 py-2 bg-aero-card border border-aero-accent/30 rounded hover:border-aero-accent transition-all"
        >
          ⏮ Reset
        </button>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          className="px-4 py-2 bg-aero-card border border-aero-accent/30 rounded hover:border-aero-accent transition-all"
        >
          ◀ Step Back
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(maxSteps, currentStep + 1))}
          className="px-4 py-2 bg-aero-card border border-aero-accent/30 rounded hover:border-aero-accent transition-all"
        >
          Step ▶
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="speed" className="text-sm">
            Speed:
          </label>
          <input
            id="speed"
            type="range"
            min="0.5"
            max="2"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="text-sm">{speed}x</span>
        </div>

        <div className="ml-auto text-sm text-gray-400">
          Step {currentStep} / {maxSteps}
        </div>
      </div>

      {/* Gate Diagram SVG */}
      <div className="overflow-x-auto border border-aero-accent/20 rounded-lg bg-aero-dark p-4">
        <svg viewBox="0 0 900 400" className="w-full" style={{ minWidth: '900px' }}>
          {/* Background */}
          <rect width="900" height="400" fill="#0a1628" />

          {/* Gate area */}
          <rect x="50" y="50" width="800" height="300" fill="none" stroke="#00d4ff" strokeWidth="2" rx="8" opacity="0.3" />
          <text x="70" y="35" fill="#00d4ff" fontSize="14" fontWeight="bold">
            Gate {results.scenarioId}
          </text>

          {/* Completed tasks */}
          {completedTasks.map((task) => (
            <g key={`completed-${task.taskId}`}>
              <rect
                x={(task.startTime / 480) * 750 + 50}
                y={task.y + 50}
                width={(task.width / 480) * 750}
                height={task.height}
                fill={task.color}
                opacity="1"
                rx="4"
              />
              <text
                x={(task.startTime / 480) * 750 + 60}
                y={task.y + 50 + task.height / 2 + 5}
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {task.label}
              </text>
              <circle cx={(task.startTime / 480) * 750 + 60} cy={task.y + 50 - 15} r="8" fill="#10b981" />
              <text
                x={(task.startTime / 480) * 750 + 60}
                y={task.y + 50 - 10}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                ✓
              </text>
            </g>
          ))}

          {/* Current task (animated) */}
          {currentTask && (
            <g>
              <rect
                x={(currentTask.startTime / 480) * 750 + 50}
                y={currentTask.y + 50}
                width={(currentTask.width / 480) * 750}
                height={currentTask.height}
                fill={currentTask.color}
                opacity="0.6"
                rx="4"
                style={{
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
              <text
                x={(currentTask.startTime / 480) * 750 + 60}
                y={currentTask.y + 50 + currentTask.height / 2 + 5}
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {currentTask.label}
              </text>
              <circle
                cx={(currentTask.startTime / 480) * 750 + 60}
                cy={currentTask.y + 50 - 15}
                r="8"
                fill="#00d4ff"
                style={{
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
              <text
                x={(currentTask.startTime / 480) * 750 + 60}
                y={currentTask.y + 50 - 10}
                textAnchor="middle"
                fill="#0a1628"
                fontSize="10"
                fontWeight="bold"
              >
                ●
              </text>
            </g>
          )}

          {/* Timeline */}
          {[0, 120, 240, 360, 480].map((time) => (
            <g key={`time-${time}`}>
              <line x1={(time / 480) * 750 + 50} y1="370" x2={(time / 480) * 750 + 50} y2="380" stroke="#00d4ff" strokeWidth="2" />
              <text x={(time / 480) * 750 + 50} y="395" textAnchor="middle" fill="#999" fontSize="12">
                {time}m
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Delay Information */}
      {currentTask && currentStep > 0 && (
        <div className="p-4 bg-aero-dark rounded-lg border border-aero-accent/20">
          <h4 className="font-semibold mb-2">Current Task: {currentTask.label}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-lg font-bold">{currentTask.width.toFixed(0)} min</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Cumulative Delay</p>
              <p className="text-lg font-bold text-aero-accent">
                {delays[currentStep - 1]?.delayMinutes || 0} min
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/client/GateDiagram.tsx
git commit -m "feat: migrate GateDiagram component with animation controls"
```

---

## Task 16: Create Testing Setup and Add Component Tests

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/store/optimizationStore.test.ts`
- Create: `tests/utils/delayCalculator.test.ts`

**Step 1: Setup vitest configuration**

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 2: Create test setup file**

```typescript
// tests/setup.ts

import '@testing-library/jest-dom'
```

**Step 3: Add store tests**

```typescript
// tests/store/optimizationStore.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { useOptimizationStore } from '@/store/optimizationStore'

describe('OptimizationStore', () => {
  beforeEach(() => {
    useOptimizationStore.setState({
      config: null,
      scenario: null,
      selectedAircraft: '',
      selectedGate: '',
      weatherCondition: null,
      disruptions: [],
      groundPowerAvailable: false,
      results: null,
      selectedPlanId: null,
      isLoading: false,
      error: null,
      simulationStep: 0,
      currentPage: 'landing',
    })
  })

  it('should set config', () => {
    const mockConfig = {
      aircraft: [{ id: 'a320', name: 'A320', taskTemplate: [] }],
      weatherConditions: [],
      disruptions: [],
      gates: ['A1', 'A2'],
    }

    useOptimizationStore.getState().setConfig(mockConfig)
    expect(useOptimizationStore.getState().config).toEqual(mockConfig)
  })

  it('should set selected aircraft', () => {
    useOptimizationStore.getState().setSelectedAircraft('a320')
    expect(useOptimizationStore.getState().selectedAircraft).toBe('a320')
  })

  it('should set loading state', () => {
    useOptimizationStore.getState().setLoading(true)
    expect(useOptimizationStore.getState().isLoading).toBe(true)

    useOptimizationStore.getState().setLoading(false)
    expect(useOptimizationStore.getState().isLoading).toBe(false)
  })

  it('should reset state', () => {
    useOptimizationStore.getState().setSelectedAircraft('a320')
    useOptimizationStore.getState().setSelectedGate('A1')
    useOptimizationStore.getState().resetState()

    const state = useOptimizationStore.getState()
    expect(state.selectedAircraft).toBe('')
    expect(state.selectedGate).toBe('')
  })
})
```

**Step 4: Add utility tests**

```typescript
// tests/utils/delayCalculator.test.ts

import { describe, it, expect } from 'vitest'
import { getDelaySeverity, getDelayIndicator } from '@/utils/delayCalculator'

describe('delayCalculator', () => {
  it('should return on-time for 0 delay', () => {
    const result = getDelaySeverity(0)
    expect(result.level).toBe('on-time')
  })

  it('should return slight for 1-15 min delay', () => {
    const result = getDelaySeverity(10)
    expect(result.level).toBe('slight')
  })

  it('should return significant for >15 min delay', () => {
    const result = getDelaySeverity(30)
    expect(result.level).toBe('significant')
  })

  it('should return correct indicator for on-time', () => {
    const indicator = getDelayIndicator('on-time')
    expect(indicator.emoji).toBe('✅')
    expect(indicator.color).toBe('#10b981')
  })

  it('should return correct indicator for slight delay', () => {
    const indicator = getDelayIndicator('slight')
    expect(indicator.emoji).toBe('⚠️')
    expect(indicator.color).toBe('#f59e0b')
  })

  it('should return correct indicator for significant delay', () => {
    const indicator = getDelayIndicator('significant')
    expect(indicator.emoji).toBe('❌')
    expect(indicator.color).toBe('#ef4444')
  })
})
```

**Step 5: Commit**

```bash
git add vitest.config.ts tests/
git commit -m "feat: setup testing with vitest and add component tests"
```

---

## Task 17: Add Environment Configuration and Final Setup

**Files:**
- Modify: `package.json` (scripts)
- Create: `.gitignore` (if not exists)
- Create: `README.md`

**Step 1: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "next lint"
  }
}
```

**Step 2: Create/Update .gitignore**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
.next/
out/
dist/

# Misc
.DS_Store
*.pem
.env.local
.env.*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
```

**Step 3: Create README.md**

```markdown
# Aero-Logic Frontend

Next.js + Zustand + TypeScript refactor of the Aero-Logic aircraft optimization platform.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **State Management:** Zustand
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── optimize/page.tsx  # Optimization workflow
│   └── layout.tsx         # Root layout
├── components/
│   └── client/            # Client-side interactive components
├── store/
│   ├── optimizationStore.ts  # Zustand store
│   └── types.ts           # TypeScript interfaces
├── services/
│   └── api.ts             # API client
└── utils/
    ├── delayCalculator.ts    # Delay calculation logic
    ├── gateLayoutEngine.ts   # Task layout engine
    └── constants.ts          # App constants
```

## State Management with Zustand

The app uses Zustand for centralized state management. Access the store from any client component:

```typescript
'use client'

import { useOptimizationStore } from '@/store/optimizationStore'

export default function MyComponent() {
  const { scenario, setSelectedAircraft, results } = useOptimizationStore()
  // Use store...
}
```

## API Configuration

Set the API base URL via environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Or deploy to any Node.js hosting (Render, Railway, etc.):

```bash
npm run build
npm start
```
```

**Step 4: Commit**

```bash
git add package.json .gitignore README.md
git commit -m "feat: add configuration, gitignore, and documentation"
```

---

## Task 18: Verify Build and Fix Any Issues

**Files:**
- Verify all files exist and compile

**Step 1: Run the development server**

```bash
npm run dev
```

Expected output: "ready - started server on 0.0.0.0:3000"

**Step 2: Check TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected output: No errors

**Step 3: Run tests**

```bash
npm test
```

Expected output: All tests pass

**Step 4: Build the project**

```bash
npm run build
```

Expected output: "successfully compiled client and server modules"

**Step 5: Commit final verification**

```bash
git commit --allow-empty -m "docs: verify build and TypeScript compilation successful"
```

---

## Task 19: Migration Summary and Next Steps

**Deliverables Completed:**

✅ Next.js 14+ App Router setup  
✅ Full TypeScript migration (types.ts, all components)  
✅ Zustand state management (eliminates prop drilling)  
✅ Typed API service layer (axios + error handling)  
✅ Component migration (9 components + container)  
✅ Utility functions (TypeScript with tests)  
✅ Landing page (Server Component)  
✅ Optimization workflow page (Client Component)  
✅ Tailwind CSS styling (custom theme preserved)  
✅ Testing infrastructure (Vitest + test examples)  
✅ Environment configuration (.env.local/.env.example)  
✅ Documentation (README, code comments)  

**What Changed:**

| Aspect | Before | After |
|--------|--------|-------|
| Build Tool | Vite SPA | Next.js SSR |
| Language | JavaScript | TypeScript |
| State Management | Props drilling | Zustand store |
| Type Safety | None | Full type coverage |
| Testing | Utility tests only | Store + utility tests |
| Performance | Client-side rendering | SSR + automatic code splitting |

**Files Created: 23 main files + configuration**

```
docs/plans/2026-04-06-nextjs-refactor.md (this file)
src/
  app/
    layout.tsx
    page.tsx
    optimize/page.tsx
    globals.css
  components/
    client/
      ScenarioPanel.tsx
      OptimizationStatus.tsx
      PlanCard.tsx
      PlanCards.tsx
      ComparisonTable.tsx
      GanttTimeline.tsx
      ExplainabilityPanel.tsx
      GateDiagram.tsx
  lib/
    providers.tsx
  store/
    types.ts
    optimizationStore.ts
  services/
    api.ts
  utils/
    delayCalculator.ts
    gateLayoutEngine.ts
    constants.ts
package.json (updated)
tsconfig.json
next.config.js
tailwind.config.ts
postcss.config.js
vitest.config.ts
.env.local
.env.example
.gitignore
README.md
tests/
  setup.ts
  store/optimizationStore.test.ts
  utils/delayCalculator.test.ts
```

---

**Estimated Implementation Time:** 3-4 hours for a skilled developer

**Git Commits:** 19 atomic commits for easy review/rollback

**Next Steps After Implementation:**
1. Deploy to Vercel or Railway
2. Run full end-to-end tests with backend
3. Add E2E tests with Playwright/Cypress
4. Monitor performance metrics
5. Add additional unit tests for components
6. Set up CI/CD pipeline

