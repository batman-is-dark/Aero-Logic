# Quick Start Guide - K2Think Vite + React Application

## Installation & Setup

### 1. Install Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Start Development Server
```bash
npm run dev
```
Server runs at `http://localhost:5173`

### 3. Start Backend
In another terminal:
```bash
cd backend
python main.py
```
Backend runs at `http://localhost:8000`

### 4. Access Application
Open browser to `http://localhost:5173`

---

## Application Flow

### Landing Page
1. User sees hero section with K2Think branding
2. Three demo scenario cards (Standard, Weather, Maintenance)
3. Click "Start Simulation" to enter optimization interface

### Simulation Page
1. **Left Sidebar (ScenarioPanel)**
   - Select Aircraft Type (dropdown)
   - Enter Gate (text input)
   - Select Weather (dropdown)
   - Click "Run Optimization"

2. **Right Content Area**
   - **Optimization Status** (while loading)
   - **Plan Cards** (3 plans displayed)
     - K2 RECOMMENDED badge if it's K2's pick
     - OPTIMAL badge if currently selected
     - Click card to select
   - **Task Timeline** (Gantt chart)
   - **Comparison Table** (metrics with green highlights)
   - **Explainability Panel** (3 tabs)
     - Justification: Why K2 recommends this
     - Comparison: AI vs Optimizer
     - Details: Plan metrics and tasks
   - **Gate Diagram** (animated task sequence)

---

## Key UI Features

### K2 RECOMMENDED Badge (Gold)
- **When:** Plan is K2's recommendation but not selected
- **Style:** Gold border, star icon, "K2 RECOMMENDED" text
- **Color:** `aero-warning` (#f59e0b)

### OPTIMAL Badge (Cyan)
- **When:** Plan is currently selected
- **Style:** Cyan border, checkmark icon, "OPTIMAL" text
- **Color:** `aero-accent` (#06b6d4)

### Comparison Table Highlights
- **Best values** are highlighted in green
- Lower is better for: Turnaround Time, Total Delay
- Higher is better for: K2 Score, Resource Utilization

### Gantt Timeline
- Color-coded by task type
- Time axis at top with 30-minute intervals
- Hover for task details

---

## File Structure Reference

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router (landing/simulation)
├── index.css                   # Global Tailwind styles
├── components/
│   ├── LandingPage.jsx         # Hero + demo scenarios
│   ├── SimulationPage.jsx      # Main layout + state
│   ├── ScenarioPanel.jsx       # Config form (left sidebar)
│   ├── PlanCard.jsx            # Plan display
│   ├── GanttTimeline.jsx       # Task timeline chart
│   ├── ComparisonTable.jsx     # Metrics comparison
│   ├── ExplainabilityPanel.jsx # K2 reasoning tabs
│   ├── OptimizationStatus.jsx  # Loading spinner
│   └── GateDiagram.jsx         # Animated diagram (existing)
├── contexts/
│   └── AppContext.jsx          # Global config state
└── services/
    └── api.js                  # Backend API calls
```

---

## API Endpoints (Backend)

```
GET  /api/config/aircraft-types      → List of aircraft
GET  /api/config/weather-conditions  → List of weather conditions
GET  /api/config/disruptions         → List of disruptions

POST /api/optimize                   → Run optimization
     Body: { scenario: { aircraft_type, gate, weather, ... } }
     Response: { plans: [...], selected_plan: {...} }

POST /api/scenario/generate          → Generate scenario
POST /api/scenario/disruption        → Generate disruption scenario
POST /api/scenario/random            → Generate random scenario
```

---

## Development Commands

```bash
# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Output: dist/ folder with optimized assets
```

---

## Tailwind Theme Colors

```
aero-dark:      #0f172a   (primary background)
aero-card:      #1e293b   (card backgrounds)
aero-accent:    #06b6d4   (cyan - primary action)
aero-warning:   #f59e0b   (gold - recommendation)
```

---

## Component Props

### PlanCard
```jsx
<PlanCard
  plan={planObject}           // Plan data
  isSelected={boolean}        // Show OPTIMAL badge
  isK2Recommended={boolean}   // Show K2 RECOMMENDED badge
  onSelect={callback}         // Select handler
/>
```

### SimulationPage
```jsx
<SimulationPage
  onBackToLanding={callback}  // Navigate to landing
/>
```

### ScenarioPanel
```jsx
<ScenarioPanel
  onOptimize={callback}       // Optimization handler
  isLoading={boolean}         // Button loading state
/>
```

---

## Common Tasks

### Change Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  'aero-dark': '#0f172a',
  'aero-card': '#1e293b',
  'aero-accent': '#06b6d4',
  'aero-warning': '#f59e0b',
}
```

### Add New Component
1. Create file: `src/components/NewComponent.jsx`
2. Import in parent component
3. Add component logic with React hooks
4. Use Tailwind classes for styling

### Debug API Calls
1. Open DevTools Network tab
2. Look for `/api/` requests
3. Check request/response payloads
4. Verify backend response structure

### Styling a Component
1. Use Tailwind classes (e.g., `className="p-4 bg-aero-card rounded-lg"`)
2. Use `@apply` in CSS for complex selectors
3. Custom colors available as `aero-*` classes
4. Responsive: `sm:`, `md:`, `lg:` prefixes

---

## Troubleshooting

### Dev Server Not Starting
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
- Kill port 5173: Windows Task Manager → Find node.exe → End Task

### API Not Connecting
- Check backend running on `http://localhost:8000`
- Check CORS configuration in FastAPI
- Verify API proxy in `vite.config.js`

### Styles Not Applying
- Ensure Tailwind classes are in template strings (not concatenated)
- Check custom colors are defined in `tailwind.config.js`
- Restart dev server after changing Tailwind config

### Components Not Rendering
- Check console for errors (DevTools)
- Verify component is imported in parent
- Check props are passed correctly
- Ensure component returns JSX

---

## Production Deployment

1. **Build:** `npm run build` → creates `dist/` folder
2. **Upload:** Deploy contents of `dist/` to web server
3. **Backend:** Ensure FastAPI backend is accessible
4. **CORS:** Update allowed origins in backend for production domain

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: Full support

---

**Last Updated:** April 7, 2026
**Status:** ✅ Ready for Development
