# Gate-Level Diagram Visualization Design
**Date**: April 6, 2026  
**Feature**: Interactive animated gate diagram showing task sequencing and dependencies  
**Status**: Design Approved

---

## Overview

Add an interactive animated gate-level diagram that visualizes aircraft turnaround task sequencing, dependencies, and delay cascading. The diagram will appear as a tab in the ExplainabilityPanel and provide playback controls for step-through animation.

---

## Requirements

### Functional Requirements

1. **Visualization**
   - Display tasks as abstract resource boxes arranged by dependency
   - Show parallel tasks on same horizontal level
   - Show sequential tasks stacked vertically
   - Color-code tasks by category (Fuel, Cargo, Service, Safety, etc.)
   - Highlight active task during animation with spinning indicator
   - Show arrows indicating task dependencies (A→B means A blocks B)

2. **Animation & Playback**
   - Auto-play mode with selectable speeds (0.5x, 1x, 2x)
   - Step-through controls (Next/Previous task)
   - Play/Pause buttons
   - Real-time display of: current task, time elapsed, time remaining, total turnaround
   - Status badges: ✓ On-time (green), ⚠ Slight delay (yellow), ✗ Significant delay (red)

3. **Delay Cascade Visualization**
   - Show numeric delay indicator (+5m, +10m) on delayed tasks
   - Highlight which downstream tasks are affected by an upstream delay
   - On hover, show: "If [Task] delays by Xm, then [downstream tasks] delayed by Xm"
   - Color intensity increases with delay magnitude

4. **Responsive Design**
   - Diagram is horizontally scrollable for many parallel tasks
   - Vertically resizable to show more/fewer task rows
   - Mobile-friendly: stack resources vertically on small screens

### Non-Functional Requirements

- No backend changes required (all logic is frontend)
- Reuse existing task_timeline data structure
- Animation smooth at 60fps
- Support both estimated and actual task durations
- Responsive to plan selection changes

---

## Architecture

### Component Hierarchy

```
ExplainabilityPanel
├── Tabs: [K2 Justification] [AI vs Optimizer] [Plan Details] [Gate Diagram] ← NEW
│   └── GateDiagram (if activeTab === 'gate-diagram')
│       ├── GateDiagramRenderer (renders the diagram)
│       ├── PlaybackControls
│       │   ├── Play/Pause buttons
│       │   ├── Step forward/back
│       │   └── Speed selector (0.5x, 1x, 2x)
│       ├── TimelineStatus
│       │   ├── Current task name
│       │   ├── Time elapsed / remaining
│       │   └── Progress indicator
│       └── DelayIndicator
│           ├── Cascade chain visualization
│           └── Impact summary
```

### Data Flow

```
selectedPlan.task_timeline (from K2 response)
    ↓
Extract:
  - Task sequence order
  - Dependencies (blocked_by, blocks fields from task_library)
  - Duration estimates (duration_minutes from timeline)
    ↓
LayoutEngine (calculateLayout function):
  - Group parallel tasks (same start_minute OR independent tasks)
  - Assign row positions based on dependency chain
  - Map tasks to resource labels
    ↓
AnimationEngine (GateDiagramState):
  - Track current_step (0 to total_tasks)
  - Calculate elapsed time (sum of durations up to current)
  - Identify cascading delays
  - Determine status (on-time, slight-delay, significant-delay)
    ↓
GateDiagramRenderer:
  - Render resource boxes
  - Highlight active task
  - Draw arrows for dependencies
  - Show delay indicators
    ↓
Display + PlaybackControls
```

### File Structure

**New Files:**
- `frontend/src/components/GateDiagram.jsx` (main component, ~400 lines)
- `frontend/src/utils/gateLayoutEngine.js` (layout calculation, ~150 lines)
- `frontend/src/utils/delayCalculator.js` (cascade delay logic, ~100 lines)

**Modified Files:**
- `frontend/src/components/ExplainabilityPanel.jsx` (add tab + GateDiagram import)

---

## Visual Design

### Diagram Structure

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                         [GATE B12] Aircraft Turnaround                      ║
║  ┌─────────────┐       ┌──────────────────┐        ┌──────────────┐        ║
║  │ Fuel Truck  │       │     Aircraft     │        │  Catering    │        ║
║  │ Refueling   │──────▶│ 🔄 [ACTIVE]      │◀───────│  Truck       │        ║
║  │ 22m ✓       │       │ Elapsed: 22m     │        │ 15m ⚠ +3m    │        ║
║  └─────────────┘       └──────────────────┘        └──────────────┘        ║
║                               ▼                                             ║
║  ┌─────────────┐       ┌──────────────────┐        ┌──────────────┐        ║
║  │  Cleaning   │       │   Safety Check   │        │    Catering  │        ║
║  │   Crew      │──────▶│   (Pending)      │◀───────│   (Blocked)  │        ║
║  │ (Pending)   │       │ Time: 5m         │        │ Time: 10m    │        ║
║  └─────────────┘       └──────────────────┘        └──────────────┘        ║
║                               ▼                                             ║
║  ┌─────────────────────────────────────────────────────────────────────┐   ║
║  │                   Boarding Gates (Final)                            │   ║
║  │                      Time: 20m                                       │   ║
║  └─────────────────────────────────────────────────────────────────────┘   ║
╚═════════════════════════════════════════════════════════════════════════════╝

Delay Cascade Alert:
  ⚠ Catering +3m delay → Safety Check +3m → Boarding +3m
  Total turnaround impact: +3m
```

### Color Scheme

| Category | Color | RGB |
|----------|-------|-----|
| Fuel | Orange | `#f59e0b` |
| Cargo | Purple | `#8b5cf6` |
| Service | Green | `#10b981` |
| Safety | Red | `#ef4444` |
| Boarding | Cyan | `#00d4ff` |
| Ops | Pink | `#ec4899` |

### Status Badges

- 🟢 **On-time**: Green checkmark, no variance
- 🟡 **Slight Delay** (+1-5m): Yellow warning, "+Xm"
- 🔴 **Significant Delay** (+5m+): Red alert, "+Xm"

---

## Implementation Phases

### Phase 1: Layout Engine & Core Rendering
- Create `gateLayoutEngine.js` to convert task_timeline to layout structure
- Create basic `GateDiagram.jsx` with static diagram rendering
- Test with sample data

### Phase 2: Animation & Playback
- Implement AnimationEngine state management
- Add PlaybackControls (play/pause/step/speed)
- Add TimelineStatus display

### Phase 3: Delay Visualization
- Create `delayCalculator.js` for cascade calculations
- Add delay indicators to task boxes
- Implement hover interaction for delay cascade details

### Phase 4: Polish & Responsiveness
- Make diagram scrollable/resizable
- Mobile responsive styling
- Performance optimization for complex task sequences

### Phase 5: Integration
- Add "Gate Diagram" tab to ExplainabilityPanel
- Test with all 3 plans (A/B/C)
- Cross-browser testing

---

## Technical Considerations

### Layout Algorithm

```
Input: task_timeline array with task_id, start_minute, duration_minutes
Output: layout object with row assignments and resource positions

Algorithm:
1. Group tasks by start_minute (parallel execution)
2. For each group:
   - Check dependencies (blocked_by, blocks from task_library)
   - Assign to same row if no conflicts
   - Assign to new row if dependencies exist
3. Generate arrows for dependency relationships
4. Assign resource labels based on task type
```

### Performance

- Memoize layout calculation (only recalculate when task_timeline changes)
- Use CSS transforms for animation (GPU-accelerated)
- Throttle animation updates to 60fps
- Lazy-render off-screen elements

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not required (legacy browser)

---

## Success Criteria

✅ Gate diagram renders correctly for all 3 plans (A/B/C)  
✅ Animation plays smoothly at all speeds (0.5x, 1x, 2x)  
✅ Delay cascade calculation is accurate (tested against manual scenarios)  
✅ Diagram is scrollable and resizable without breaking layout  
✅ Mobile responsive (stacks vertically on screens < 768px)  
✅ No performance degradation for sequences with 10+ tasks  
✅ Hover interactions show delay details clearly  

---

## Out of Scope (Future)

- 3D visualization
- VR/AR gate layout
- Real aircraft dimensions/runway visualization
- Integration with live gate sensor data
- Customizable color schemes
- Export diagrams as PNG/SVG
