# Gate-Level Diagram Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build an interactive animated gate-level diagram showing aircraft turnaround task sequencing with delay cascade visualization.

**Architecture:** Three-layer system - Layout Engine (converts task_timeline to spatial layout) → Animation Engine (manages playback state) → Renderer (displays interactive diagram with controls).

**Tech Stack:** React (hooks, useMemo), CSS Grid/Flexbox for layout, requestAnimationFrame for smooth animation, SVG for arrows/connectors.

---

## Task 1: Create Layout Engine

**Files:**
- Create: `frontend/src/utils/gateLayoutEngine.js`
- Test: Manual verification with sample data

**Step 1: Understand task structure**

Review `task_library.py` to understand:
- Task categories: refueling, cargo_unload, cargo_load, boarding, catering, cleaning, safety_inspection, deice_antiice, power_cooling, door_close
- Properties: task_id, name, duration, can_parallelize, blocked_by, blocks, apu_dependent, safety_critical

**Step 2: Create layout engine structure**

Create `frontend/src/utils/gateLayoutEngine.js` with this skeleton:

```javascript
/**
 * Converts task_timeline into a layout structure for gate diagram
 * @param {Array} taskTimeline - Array of {task_id, task_name, start_minute, duration_minutes, apu_required}
 * @param {Object} taskLibrary - Task definitions with dependencies (will load from constants)
 * @returns {Object} Layout with { rows, tasks, arrows, resourceMap }
 */

// Task library constants (minimal set for categorization)
const TASK_LIBRARY = {
  refueling: { category: 'fuel', resource: 'Fuel Truck', color: '#f59e0b' },
  cargo_unload: { category: 'cargo', resource: 'Cargo Door', color: '#8b5cf6' },
  cargo_load: { category: 'cargo', resource: 'Cargo Door', color: '#8b5cf6' },
  boarding: { category: 'boarding', resource: 'Boarding Gate', color: '#00d4ff' },
  catering: { category: 'service', resource: 'Catering Truck', color: '#10b981' },
  cleaning: { category: 'service', resource: 'Cleaning Crew', color: '#10b981' },
  safety_inspection: { category: 'safety', resource: 'Safety Check', color: '#ef4444' },
  deice_antiice: { category: 'safety', resource: 'De-ice/Anti-ice', color: '#ef4444' },
  power_cooling: { category: 'ops', resource: 'Power/Cooling', color: '#ec4899' },
  door_close: { category: 'ops', resource: 'Door Close', color: '#ec4899' },
};

export function calculateLayout(taskTimeline) {
  if (!taskTimeline || taskTimeline.length === 0) {
    return { rows: [], tasks: {}, arrows: [], resourceMap: {} };
  }

  // TODO: Implement layout calculation
  return {
    rows: [],          // Array of arrays - each sub-array is a row of parallel tasks
    tasks: {},         // Map of task_id -> { rowIndex, colIndex, task_name, duration, ... }
    arrows: [],        // Array of { from: task_id, to: task_id }
    resourceMap: {},   // Map of task_id -> resource label
  };
}

export function getTaskColor(taskId) {
  const task = TASK_LIBRARY[taskId];
  return task?.color || '#6b7280';
}

export function getTaskResource(taskId) {
  const task = TASK_LIBRARY[taskId];
  return task?.resource || 'Unknown';
}
```

**Step 3: Implement layout algorithm**

Update `calculateLayout` function:

```javascript
export function calculateLayout(taskTimeline) {
  if (!taskTimeline || taskTimeline.length === 0) {
    return { rows: [], tasks: {}, arrows: [], resourceMap: {} };
  }

  const rows = [];
  const tasks = {};
  const arrows = [];
  const resourceMap = {};
  
  // Create lookup for task dependencies (simplified - assume no blocks)
  // In a real system, we'd fetch this from backend
  const taskDependencies = {};
  
  let currentRow = 0;
  let tasksPlaced = new Set();
  
  // Process tasks in timeline order
  for (let i = 0; i < taskTimeline.length; i++) {
    const task = taskTimeline[i];
    
    // Initialize row if needed
    if (!rows[currentRow]) {
      rows[currentRow] = [];
    }
    
    // Place task in current row
    const colIndex = rows[currentRow].length;
    rows[currentRow].push(task.task_id);
    
    tasks[task.task_id] = {
      task_id: task.task_id,
      task_name: task.task_name,
      duration_minutes: task.duration_minutes,
      start_minute: task.start_minute,
      end_minute: task.end_minute,
      apu_required: task.apu_required,
      rowIndex: currentRow,
      colIndex: colIndex,
      status: 'pending', // pending, active, completed, delayed
    };
    
    resourceMap[task.task_id] = getTaskResource(task.task_id);
    tasksPlaced.add(task.task_id);
    
    // If next task has different start_minute, move to new row
    if (i < taskTimeline.length - 1) {
      const nextTask = taskTimeline[i + 1];
      if (nextTask.start_minute > task.start_minute) {
        currentRow++;
      }
    }
  }
  
  // Generate arrows for sequential flow
  for (let i = 0; i < taskTimeline.length - 1; i++) {
    const currentTask = taskTimeline[i];
    const nextTask = taskTimeline[i + 1];
    
    // Only draw arrow if tasks are on different rows (sequential dependency)
    if (tasks[currentTask.task_id].rowIndex < tasks[nextTask.task_id].rowIndex) {
      arrows.push({
        from: currentTask.task_id,
        to: nextTask.task_id,
        type: 'sequential',
      });
    }
  }
  
  return { rows, tasks, arrows, resourceMap };
}
```

**Step 4: Test layout engine with sample data**

Create a simple test file to verify output structure. Create `frontend/src/utils/gateLayoutEngine.test.js`:

```javascript
import { calculateLayout, getTaskColor, getTaskResource } from './gateLayoutEngine';

describe('Gate Layout Engine', () => {
  const sampleTimeline = [
    { task_id: 'refueling', task_name: 'Refueling', start_minute: 0, duration_minutes: 22, end_minute: 22, apu_required: false },
    { task_id: 'cargo_unload', task_name: 'Cargo Unloading', start_minute: 0, duration_minutes: 20, end_minute: 20, apu_required: false },
    { task_id: 'catering', task_name: 'Catering', start_minute: 22, duration_minutes: 15, end_minute: 37, apu_required: true },
    { task_id: 'boarding', task_name: 'Boarding', start_minute: 37, duration_minutes: 20, end_minute: 57, apu_required: true },
  ];

  test('calculateLayout returns correct structure', () => {
    const layout = calculateLayout(sampleTimeline);
    
    expect(layout).toHaveProperty('rows');
    expect(layout).toHaveProperty('tasks');
    expect(layout).toHaveProperty('arrows');
    expect(layout).toHaveProperty('resourceMap');
    expect(Object.keys(layout.tasks).length).toBe(4);
  });

  test('getTaskColor returns correct hex color', () => {
    expect(getTaskColor('refueling')).toBe('#f59e0b');
    expect(getTaskColor('safety_inspection')).toBe('#ef4444');
  });

  test('getTaskResource returns correct resource label', () => {
    expect(getTaskResource('refueling')).toBe('Fuel Truck');
    expect(getTaskResource('boarding')).toBe('Boarding Gate');
  });
});
```

Run: `npm test -- gateLayoutEngine.test.js`
Expected: 3 tests pass

**Step 5: Commit**

```bash
git add frontend/src/utils/gateLayoutEngine.js frontend/src/utils/gateLayoutEngine.test.js
git commit -m "feat: add gate layout engine for task sequence visualization"
```

---

## Task 2: Create Delay Calculator

**Files:**
- Create: `frontend/src/utils/delayCalculator.js`

**Step 1: Implement delay cascade logic**

Create `frontend/src/utils/delayCalculator.js`:

```javascript
/**
 * Calculates cascading delays through task sequence
 * @param {Array} taskTimeline - Task timeline from plan
 * @param {Object} taskDelays - Map of task_id -> actual_delay_minutes
 * @returns {Object} { taskImpacts, totalDelayMinutes, cascadeChain }
 */

export function calculateDelayCascade(taskTimeline, taskDelays = {}) {
  if (!taskTimeline || taskTimeline.length === 0) {
    return { taskImpacts: {}, totalDelayMinutes: 0, cascadeChain: [] };
  }

  const taskImpacts = {}; // task_id -> total_delay_caused_to_downstream
  const cascadeChain = []; // [task_id, affected_count, total_impact]

  // For each task, calculate how delay cascades to downstream tasks
  for (let i = 0; i < taskTimeline.length; i++) {
    const currentTask = taskTimeline[i];
    const currentDelay = taskDelays[currentTask.task_id] || 0;

    if (currentDelay === 0) continue;

    // All subsequent tasks will be delayed by at least currentDelay
    // (unless they can run in parallel, which we simplify by assuming they can't)
    let cascadeDelay = currentDelay;
    let affectedCount = 0;

    for (let j = i + 1; j < taskTimeline.length; j++) {
      const downstreamTask = taskTimeline[j];
      const previousEndTime = taskTimeline[j - 1].end_minute + (taskDelays[taskTimeline[j - 1].task_id] || 0);
      
      // If downstream task starts immediately after previous (no gap), it's affected
      if (downstreamTask.start_minute <= previousEndTime) {
        taskImpacts[downstreamTask.task_id] = (taskImpacts[downstreamTask.task_id] || 0) + cascadeDelay;
        affectedCount++;
      }
    }

    if (affectedCount > 0) {
      cascadeChain.push({
        source: currentTask.task_id,
        sourceDelay: currentDelay,
        affectedTasks: affectedCount,
        totalDownstreamImpact: cascadeDelay * affectedCount,
      });
    }
  }

  const totalDelayMinutes = Object.values(taskImpacts).reduce((sum, val) => sum + val, 0);

  return { taskImpacts, totalDelayMinutes, cascadeChain };
}

/**
 * Categorizes delay severity
 * @param {number} delayMinutes - Delay in minutes
 * @returns {string} 'on-time' | 'slight-delay' | 'significant-delay'
 */
export function getDelaySeverity(delayMinutes) {
  if (delayMinutes === 0) return 'on-time';
  if (delayMinutes <= 5) return 'slight-delay';
  return 'significant-delay';
}

/**
 * Gets visual indicator for delay
 * @param {string} severity - From getDelaySeverity
 * @returns {Object} { emoji, color, label }
 */
export function getDelayIndicator(severity) {
  const indicators = {
    'on-time': { emoji: '🟢', color: '#10b981', label: 'On Time', abbreviation: '✓' },
    'slight-delay': { emoji: '🟡', color: '#f59e0b', label: 'Slight Delay', abbreviation: '⚠' },
    'significant-delay': { emoji: '🔴', color: '#ef4444', label: 'Delayed', abbreviation: '✗' },
  };
  return indicators[severity] || indicators['on-time'];
}
```

**Step 2: Test delay calculator**

Create `frontend/src/utils/delayCalculator.test.js`:

```javascript
import { calculateDelayCascade, getDelaySeverity, getDelayIndicator } from './delayCalculator';

describe('Delay Calculator', () => {
  const sampleTimeline = [
    { task_id: 'task1', task_name: 'Task 1', start_minute: 0, end_minute: 10, duration_minutes: 10 },
    { task_id: 'task2', task_name: 'Task 2', start_minute: 10, end_minute: 20, duration_minutes: 10 },
    { task_id: 'task3', task_name: 'Task 3', start_minute: 20, end_minute: 30, duration_minutes: 10 },
  ];

  test('calculateDelayCascade with no delays', () => {
    const result = calculateDelayCascade(sampleTimeline, {});
    expect(result.totalDelayMinutes).toBe(0);
    expect(result.cascadeChain.length).toBe(0);
  });

  test('calculateDelayCascade with single task delay', () => {
    const result = calculateDelayCascade(sampleTimeline, { task1: 5 });
    expect(result.taskImpacts.task2).toBe(5);
    expect(result.taskImpacts.task3).toBe(5);
    expect(result.cascadeChain.length).toBeGreaterThan(0);
  });

  test('getDelaySeverity categorizes correctly', () => {
    expect(getDelaySeverity(0)).toBe('on-time');
    expect(getDelaySeverity(3)).toBe('slight-delay');
    expect(getDelaySeverity(10)).toBe('significant-delay');
  });

  test('getDelayIndicator returns correct emoji', () => {
    expect(getDelayIndicator('on-time').emoji).toBe('🟢');
    expect(getDelayIndicator('slight-delay').emoji).toBe('🟡');
    expect(getDelayIndicator('significant-delay').emoji).toBe('🔴');
  });
});
```

Run: `npm test -- delayCalculator.test.js`
Expected: 4 tests pass

**Step 3: Commit**

```bash
git add frontend/src/utils/delayCalculator.js frontend/src/utils/delayCalculator.test.js
git commit -m "feat: add delay cascade calculation logic"
```

---

## Task 3: Create Gate Diagram Component

**Files:**
- Create: `frontend/src/components/GateDiagram.jsx`

**Step 1: Create component skeleton**

Create `frontend/src/components/GateDiagram.jsx`:

```javascript
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { calculateLayout, getTaskColor, getTaskResource } from '../utils/gateLayoutEngine';
import { calculateDelayCascade, getDelaySeverity, getDelayIndicator } from '../utils/delayCalculator';

/**
 * Interactive animated gate diagram showing task sequencing and delays
 * @param {Object} selectedPlan - Plan object with task_timeline
 */
export function GateDiagram({ selectedPlan }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  const [hoveredTask, setHoveredTask] = useState(null);
  const containerRef = useRef(null);

  if (!selectedPlan?.task_timeline || selectedPlan.task_timeline.length === 0) {
    return (
      <div className="bg-aero-dark rounded-lg p-6 text-center">
        <p className="text-gray-500">No task timeline available</p>
      </div>
    );
  }

  // Calculate layout
  const layout = useMemo(() => 
    calculateLayout(selectedPlan.task_timeline),
    [selectedPlan.task_timeline]
  );

  // Calculate delays (for now, assume no delays)
  const taskDelays = useMemo(() => ({}), []);
  const delayData = useMemo(() => 
    calculateDelayCascade(selectedPlan.task_timeline, taskDelays),
    [selectedPlan.task_timeline, taskDelays]
  );

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= selectedPlan.task_timeline.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, (1000 / speed) * 2); // Adjust timing based on speed

    return () => clearInterval(interval);
  }, [isPlaying, speed, selectedPlan.task_timeline.length]);

  // Get current task info
  const currentTask = selectedPlan.task_timeline[currentStep];
  const totalTurnaround = selectedPlan.task_timeline.length > 0 
    ? selectedPlan.task_timeline[selectedPlan.task_timeline.length - 1].end_minute 
    : 0;

  return (
    <div className="bg-aero-dark rounded-lg border border-gray-700 overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-aero-accent text-aero-dark rounded text-sm font-medium hover:bg-aero-accent/90"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Step
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(selectedPlan.task_timeline.length - 1, currentStep + 1))}
            disabled={currentStep === selectedPlan.task_timeline.length - 1}
            className="px-3 py-1 bg-gray-700 text-white rounded text-sm font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Step →
          </button>

          <div className="flex-1" />

          <label className="text-xs text-gray-400">Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="px-2 py-1 bg-gray-700 text-white rounded text-sm"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        {/* Status Bar */}
        <div className="bg-aero-card rounded p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Current Task:</span>
            <span className="text-white font-semibold">{currentTask.task_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Progress:</span>
            <span className="text-aero-accent">{currentStep + 1}/{selectedPlan.task_timeline.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time Elapsed:</span>
            <span className="text-white">{currentTask.start_minute + currentTask.duration_minutes}m / {totalTurnaround}m</span>
          </div>
        </div>
      </div>

      {/* Diagram Container - Scrollable */}
      <div
        ref={containerRef}
        className="overflow-auto scrollbar-thin p-6"
        style={{ height: '400px' }}
      >
        {/* TODO: Render gate diagram here */}
        <div className="text-gray-400 text-sm">Gate diagram rendering...</div>
      </div>

      {/* Delay Information */}
      {delayData.cascadeChain.length > 0 && (
        <div className="border-t border-gray-700 p-4 bg-aero-warning/5">
          <div className="text-xs text-aero-warning mb-2">⚠ Delay Cascade Detected</div>
          <div className="text-xs text-gray-400 space-y-1">
            {delayData.cascadeChain.map((cascade, idx) => (
              <div key={idx}>
                {cascade.source}: +{cascade.sourceDelay}m → {cascade.affectedTasks} tasks affected
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit basic structure**

```bash
git add frontend/src/components/GateDiagram.jsx
git commit -m "feat: add gate diagram component skeleton with controls"
```

---

## Task 4: Implement Diagram Rendering

**Files:**
- Modify: `frontend/src/components/GateDiagram.jsx`

**Step 1: Add SVG/Canvas rendering logic**

Update the diagram container in `GateDiagram.jsx` to render task boxes and arrows:

```javascript
// Add this inside the GateDiagram component, replace the TODO comment:

{/* Task Diagram */}
<svg width="100%" height="100%" style={{ minHeight: '300px' }}>
  {/* Render arrows first (so they appear behind boxes) */}
  {layout.arrows.map((arrow, idx) => {
    const fromTask = layout.tasks[arrow.from];
    const toTask = layout.tasks[arrow.to];
    
    if (!fromTask || !toTask) return null;
    
    const fromX = 100 + fromTask.colIndex * 180;
    const fromY = 50 + fromTask.rowIndex * 120;
    const toX = 100 + toTask.colIndex * 180;
    const toY = 50 + toTask.rowIndex * 120;
    
    return (
      <g key={`arrow-${idx}`}>
        <line
          x1={fromX + 70}
          y1={fromY + 50}
          x2={toX + 70}
          y2={toY}
          stroke="#6b7280"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
      </g>
    );
  })}

  {/* Arrow marker definition */}
  <defs>
    <marker
      id="arrowhead"
      markerWidth="10"
      markerHeight="10"
      refX="9"
      refY="3"
      orient="auto"
    >
      <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
    </marker>
  </defs>

  {/* Render task boxes */}
  {Object.entries(layout.tasks).map(([taskId, task]) => {
    const isActive = taskId === currentTask.task_id;
    const isCompleted = selectedPlan.task_timeline.findIndex(t => t.task_id === taskId) < currentStep;
    const isHovered = hoveredTask === taskId;
    const color = getTaskColor(taskId);
    const x = 100 + task.colIndex * 180;
    const y = 50 + task.rowIndex * 120;
    const delay = taskDelays[taskId] || 0;
    const severity = getDelaySeverity(delay);
    const indicator = getDelayIndicator(severity);

    return (
      <g key={taskId}>
        {/* Task box */}
        <rect
          x={x}
          y={y}
          width="140"
          height="50"
          fill={isActive ? color : '#1f2937'}
          stroke={isActive ? color : isHovered ? color : '#374151'}
          strokeWidth={isActive ? 3 : isHovered ? 2 : 1}
          rx="4"
          opacity={isCompleted ? 0.6 : 1}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={() => setHoveredTask(taskId)}
          onMouseLeave={() => setHoveredTask(null)}
        />

        {/* Spinning indicator if active */}
        {isActive && (
          <circle
            cx={x + 70}
            cy={y + 25}
            r="6"
            fill={color}
            style={{
              animation: 'spin 1s linear infinite',
              transformOrigin: `${x + 70}px ${y + 25}px`,
            }}
          />
        )}

        {/* Task name */}
        <text
          x={x + 70}
          y={y + 18}
          textAnchor="middle"
          fill={isActive ? '#000' : '#d1d5db'}
          fontSize="12"
          fontWeight="bold"
        >
          {task.task_name}
        </text>

        {/* Duration */}
        <text
          x={x + 70}
          y={y + 35}
          textAnchor="middle"
          fill={isActive ? '#000' : '#9ca3af'}
          fontSize="11"
        >
          {task.duration_minutes}m {indicator.abbreviation}
        </text>

        {/* Delay badge if delayed */}
        {delay > 0 && (
          <text
            x={x + 130}
            y={y + 15}
            textAnchor="end"
            fill={indicator.color}
            fontSize="10"
            fontWeight="bold"
          >
            +{delay}m
          </text>
        )}
      </g>
    );
  })}
</svg>

<style>{`
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`}</style>
```

**Step 2: Add CSS animation support**

Add this to `GateDiagram.jsx` at the top level (within the component but outside JSX):

```javascript
// Add CSS keyframes for animation
const animationStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Add this before the return statement
React.useEffect(() => {
  const style = document.createElement('style');
  style.textContent = animationStyle;
  document.head.appendChild(style);
  return () => style.remove();
}, []);
```

**Step 3: Commit rendering**

```bash
git add frontend/src/components/GateDiagram.jsx
git commit -m "feat: implement SVG rendering of task boxes and dependency arrows"
```

---

## Task 5: Add Gate Diagram Tab to ExplainabilityPanel

**Files:**
- Modify: `frontend/src/components/ExplainabilityPanel.jsx`

**Step 1: Import GateDiagram**

At the top of `ExplainabilityPanel.jsx`, add:

```javascript
import { GateDiagram } from './GateDiagram';
```

**Step 2: Add gate-diagram tab**

Find the tab buttons section (around line 80-90) and add a new tab button:

```javascript
<button
  onClick={() => setActiveTab('gate-diagram')}
  className={`px-4 py-3 text-sm font-medium transition-colors ${
    activeTab === 'gate-diagram' 
      ? 'text-aero-accent border-b-2 border-aero-accent bg-aero-dark/50' 
      : 'text-gray-400 hover:text-white'
  }`}
>
  Gate Diagram
</button>
```

**Step 3: Add gate-diagram tab content**

Find the `{activeTab === 'details' && (` section and add this after it:

```javascript
{activeTab === 'gate-diagram' && (
  <GateDiagram selectedPlan={fullPlan} />
)}
```

**Step 4: Commit**

```bash
git add frontend/src/components/ExplainabilityPanel.jsx
git commit -m "feat: add gate diagram tab to explainability panel"
```

---

## Task 6: Test Full Integration

**Files:**
- No new files
- Test: Manual testing in browser

**Step 1: Start backend and frontend**

In one terminal:
```bash
# Terminal 1: Backend
cd backend
python main.py
```

In another terminal:
```bash
# Terminal 2: Frontend
cd frontend
npm run dev
```

**Step 2: Test the feature**

1. Navigate to http://localhost:5174 (or port shown)
2. Configure a scenario and run optimization
3. Click on a plan card
4. In ExplainabilityPanel, find the "Gate Diagram" tab
5. Verify:
   - ✓ Diagram renders task boxes with correct names
   - ✓ Arrows connect tasks showing dependencies
   - ✓ Play/Pause buttons work
   - ✓ Step forward/back buttons work
   - ✓ Speed selector changes animation timing
   - ✓ Status bar updates current task info
   - ✓ Horizontal scroll works for many tasks
   - ✓ No console errors

**Step 3: Test with all 3 plans**

- Click Plan A, verify diagram updates
- Click Plan B, verify diagram updates
- Click Plan C, verify diagram updates

**Step 4: Verify responsive behavior**

- Resize browser window
- Verify diagram scales properly
- Verify controls remain accessible

**Step 5: Commit test verification**

```bash
git add -A
git commit -m "test: verify gate diagram integration and functionality"
```

---

## Task 7: Polish and Performance Optimization

**Files:**
- Modify: `frontend/src/components/GateDiagram.jsx`
- Modify: `frontend/src/utils/gateLayoutEngine.js`

**Step 1: Optimize layout memoization**

In `GateDiagram.jsx`, ensure layout is memoized:

```javascript
const layout = useMemo(() => 
  calculateLayout(selectedPlan.task_timeline),
  [selectedPlan.task_timeline]
);
```

**Step 2: Add scroll container styling**

Update the diagram container div:

```javascript
<div
  ref={containerRef}
  className="overflow-auto scrollbar-thin p-6 bg-aero-card"
  style={{ 
    height: '400px',
    backgroundColor: '#111827',
  }}
>
```

**Step 3: Add mobile responsiveness**

Add this to the container className:

```javascript
className="overflow-auto scrollbar-thin p-4 md:p-6 bg-aero-card h-96 md:h-full"
```

**Step 4: Test on mobile viewport**

Use Chrome DevTools device emulation:
1. Press F12
2. Click device toggle
3. Select iPhone 12
4. Verify diagram is still usable

**Step 5: Commit optimization**

```bash
git add frontend/src/components/GateDiagram.jsx frontend/src/utils/gateLayoutEngine.js
git commit -m "perf: optimize layout memoization and add responsive styling"
```

---

## Task 8: Add Delay Visualization Details

**Files:**
- Modify: `frontend/src/components/GateDiagram.jsx`

**Step 1: Add hover interaction for cascade details**

When hovering over a task, show which downstream tasks would be affected:

```javascript
// Add this state
const [cascadeDetails, setCascadeDetails] = useState(null);

// Update onMouseEnter handler
onMouseEnter={() => {
  setHoveredTask(taskId);
  if (delayData.cascadeChain.length > 0) {
    const cascade = delayData.cascadeChain.find(c => c.source === taskId);
    if (cascade) setCascadeDetails(cascade);
  }
}}

// Add tooltip near the diagram
{cascadeDetails && (
  <div className="absolute bg-gray-900 border border-aero-warning rounded p-2 text-xs text-aero-warning max-w-xs">
    <div className="font-semibold mb-1">{cascadeDetails.source}</div>
    <div>Delay: +{cascadeDetails.sourceDelay}m</div>
    <div>Affects: {cascadeDetails.affectedTasks} downstream tasks</div>
    <div>Total impact: +{cascadeDetails.totalDownstreamImpact}m</div>
  </div>
)}
```

**Step 2: Commit**

```bash
git add frontend/src/components/GateDiagram.jsx
git commit -m "feat: add interactive delay cascade details on hover"
```

---

## Execution Checklist

- [ ] Task 1: Layout Engine ✓
- [ ] Task 2: Delay Calculator ✓
- [ ] Task 3: Gate Diagram Component Skeleton ✓
- [ ] Task 4: Implement Diagram Rendering ✓
- [ ] Task 5: Add Tab to ExplainabilityPanel ✓
- [ ] Task 6: Full Integration Testing ✓
- [ ] Task 7: Polish & Optimization ✓
- [ ] Task 8: Delay Visualization Details ✓

---

## Success Criteria

✅ Gate diagram renders all tasks with correct names and durations  
✅ Animation controls (play/pause/step/speed) work smoothly  
✅ Horizontal scrolling works for sequences with 10+ tasks  
✅ Dependency arrows connect tasks correctly  
✅ Status bar updates in real-time during animation  
✅ Delay cascade information displays on hover  
✅ Works correctly with all 3 plans (A/B/C)  
✅ Mobile responsive (tested on multiple screen sizes)  
✅ No console errors or warnings  
✅ Smooth 60fps animation performance
