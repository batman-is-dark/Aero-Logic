# Dashboard Fixes & Interactive Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix gate diagram panel connections, display full task sequence, fill K2 justification fields, add disruption-aware task sequencing, and enhance dashboard interactivity.

**Architecture:** Need to fix the layout engine for proper dependency arrows, update ExplainabilityPanel to read correct response fields, enhance disruption handling in counterfactual.py, and add more interactive features to GanttTimeline and GateDiagram.

**Tech Stack:** React, SVG for gate diagram, Tailwind CSS for styling

---

### Task 1: Fix Gate Diagram Arrow Connections

**Files:**
- Modify: `frontend/src/utils/gateLayoutEngine.js:145-257`

**Step 1: Analyze current arrow logic**

Current code creates arrows between ALL sequential tasks. Should only create arrows between dependent tasks.

**Step 2: Fix arrow generation logic**

```javascript
// Replace the arrow generation section (lines 237-250) with dependency-based arrows
// Step 3: Generate arrows based on task dependencies, not just sequence
// Get dependency info from task_timeline
const taskDependencies = {};
(timeline || []).forEach(t => {
  if (t.depends_on) {
    taskDependencies[t.task_id] = t.depends_on;
  }
});

// Only create arrow if there's a dependency relationship
for (let i = 0; i < timeline.length - 1; i++) {
  const task1 = timeline[i];
  const task2 = timeline[i + 1];
  
  // Check if task2 depends on task1 (task1 blocks task2)
  const dependsOn = task2.depends_on || [];
  if (dependsOn.includes(task1.task_id)) {
    arrows.push({
      from: task1.task_id,
      to: task2.task_id,
    });
  }
}

// Step 3: Move parallel tasks to same row visually
// Fix row assignment to group parallel tasks together
```

**Step 3: Commit**

git add frontend/src/utils/gateLayoutEngine.js
git commit -m "fix: dependency-based arrows in gate diagram"

---

### Task 2: Display Full Task Sequence in Explanation

**Files:**
- Modify: `frontend/src/components/ExplainabilityPanel.jsx:33-41`

**Step 1: Read current justification rendering**

The current code reads `k2Selection?.reasoning` but the response uses different field names.

**Step 2: Fix field mappings**

```javascript
{activeTab === 'justification' && (
  <div className="space-y-4">
    <h3 className="font-semibold text-white mb-3">Why K2 Recommends This Plan</h3>
    {/* Use the correct field from response */}
    {selectedPlan?.reasoning || k2Selection?.justification || k2Selection?.reasoning ? (
      <p className="text-gray-300 leading-relaxed text-sm">
        {selectedPlan?.reasoning || k2Selection?.justification || k2Selection?.reasoning}
      </p>
    ) : (
      <p className="text-gray-400 text-sm">No justification available</p>
    )}
  </div>
)}
```

**Step 3: Similar fixes for AI vs Optimizer and Plan Details tabs**

Update the field references for all three tabs.

**Step 4: Commit**

git add frontend/src/components/ExplainabilityPanel.jsx
git commit -m "fix: correct field mappings in ExplainabilityPanel"

---

### Task 3: Add Disruption-Aware Task Sequencing

**Files:**
- Modify: `backend/counterfactual.py:1-131`

**Step 1: Analyze current disruption response**

Current counterfactual.py generates 3 scenarios but doesn't explicitly reorder tasks based on disruption.

**Step 2: Add disruption-based task priority**

In `generate_counterfactual_scenarios`, check for disruption and reorder:

```python
def generate_counterfactual_scenarios(base_scenario, task_ids=None):
    # Check for specific disruptions
    disruption = base_scenario.get("disruption", {})
    disruption_name = disruption.get("name", "") if disruption else ""
    
    # If fuel disruption, prioritize alternate tasks
    if "fuel" in disruption_name.lower():
        base_scenario["_priority_task_override"] = "cargo"
    elif "catering" in disruption_name.lower():
        base_scenario["_priority_task_override"] = "cargo_loading"
    # etc.
```

**Step 3: Update task sequencer to use priority override**

```python
# In each scenario generation, check override and adjust sequence
if base_scenario.get("_priority_task_override") == "cargo":
    # Ensure cargo tasks complete before others if fuel delayed
    # Move cargo tasks earlier in sequence
```

**Step 4: Commit**

git add backend/counterfactual.py
git commit -m "feat: add disruption-aware task sequencing"

---

### Task 4: Enhance GanttTimeline Interactivity

**Files:**
- Modify: `frontend/src/components/GanttTimeline.jsx:1-106`

**Step 1: Add click handlers and tooltips**

```javascript
// Add state for selected task
const [hoveredTask, setHoveredTask] = useState(null);

// Add onMouseEnter/onMouseLeave to task bars
<div
  onMouseEnter={() => setHoveredTask(task.task_id)}
  onMouseLeave={() => setHoveredTask(null)}
  className="cursor-pointer"
/>

// Add tooltip when hovered
{hoveredTask === task.task_id && (
  <div className="absolute z-50 bg-gray-900 p-3 rounded shadow-xl border border-gray-700 text-xs">
    <p className="font-bold text-white">{task.task_name}</p>
    <p>Start: {task.start_minute}m | End: {task.end_minute}m</p>
    <p>Duration: {task.duration_minutes}m</p>
  </div>
)}
```

**Step 2: Add time zoom controls**

```javascript
const [zoomLevel, setZoomLevel] = useState(1);

<div className="flex gap-2 mb-4">
  <button onClick={() => setZoomLevel(1)} className={zoomLevel === 1 ? 'bg-aero-accent' : 'bg-gray-700'}>1x</button>
  <button onClick={() => setZoomLevel(1.5)} className={zoomLevel === 1.5 ? 'bg-aero-accent' : 'bg-gray-700'}>1.5x</button>
  <button onClick={() => setZoomLevel(2)} className={zoomLevel === 2 ? 'bg-aero-accent' : 'bg-gray-700'}>2x</button>
</div>

// Apply zoom to timeline width
const timelineWidth = 1000 * zoomLevel;
```

**Step 3: Commit**

git add frontend/src/components/GanttTimeline.jsx
git commit -m "feat: enhance GanttTimeline interactivity"

---

### Task 5: Enhance Gate Diagram Interactivity

**Files:**
- Modify: `frontend/src/components/GateDiagram.jsx:1-447`

**Step 1: Add task click for details**

```javascript
const [selectedTaskId, setSelectedTaskId] = useState(null);

// On task box click
<rect onClick={() => setSelectedTaskId(taskId)} className="cursor-pointer" />

// Add detail panel when selected
{selectedTaskId && (
  <div className="absolute bottom-0 left-0 right-0 bg-gray-900 p-4 border-t border-gray-700">
    <h4 className="font-bold text-white">{tasks[selectedTaskId].task_name}</h4>
    <p>Start: {tasks[selectedTaskId].start_minute}m</p>
    <p>End: {tasks[selectedTaskId].end_minute}m</p>
    <p>Duration: {tasks[selectedTaskId].duration_minutes}m</p>
    <button onClick={() => setSelectedTaskId(null)}>Close</button>
  </div>
)}
```

**Step 2: Add pan/zoom controls**

```javascript
const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 600 });

const handleZoomIn = () => setViewBox(prev => ({
  ...prev,
  width: prev.width * 0.8,
  height: prev.height * 0.8
}));
```

**Step 3: Commit**

git add frontend/src/components/GateDiagram.jsx
git commit -m "feat: enhance GateDiagram interactivity"

---

### Task 6: Test All Changes

**Step 1: Start backend**

cd backend && python -m uvicorn main:app --reload

**Step 2: Start frontend**

cd frontend && npm run dev

**Step 3: Run optimization and verify:**
- Gate diagram shows correct dependency arrows
- Full task sequence displays in explanation
- K2 justification fields populated
- Disruption affects task ordering
- Gantt timeline has tooltips and zoom
- Gate diagram has click details

**Step 4: Commit**

git add -A && git commit -m "test: verify all dashboard fixes"

---

**Plan complete and saved to `docs/plans/2026-04-08-dashboard-fix-interactive.md`. 

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**