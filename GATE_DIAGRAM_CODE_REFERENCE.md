# GateDiagram Component - Code Reference & Examples

## Component Location
```
frontend/src/components/GateDiagram.jsx
```

## Import Statement
```javascript
import { GateDiagram } from './components/GateDiagram';
```

## Basic Usage Example
```javascript
import React, { useState } from 'react';
import { GateDiagram } from './components/GateDiagram';

function DashboardPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Example plan structure
  const samplePlan = {
    task_timeline: [
      {
        task_id: 'refueling',
        task_name: 'Refueling',
        start_minute: 0,
        end_minute: 15,
        duration_minutes: 15,
        apu_required: false
      },
      {
        task_id: 'boarding',
        task_name: 'Passenger Boarding',
        start_minute: 10,
        end_minute: 25,
        duration_minutes: 15,
        apu_required: false
      },
      {
        task_id: 'catering',
        task_name: 'Catering/Provisioning',
        start_minute: 15,
        end_minute: 30,
        duration_minutes: 15,
        apu_required: false
      }
    ],
    plan_id: 'A',
    strategy: 'Delay-Minimizing'
  };

  return (
    <div className="p-6">
      <h1>Gate Diagram Viewer</h1>
      <GateDiagram selectedPlan={samplePlan} />
    </div>
  );
}
```

## Animation System Explanation

### How the Animation Loop Works

```javascript
// Animation interval calculation
const baseInterval = 2000; // 2 seconds base
const interval = baseInterval / speed;

// Example intervals:
// Speed 0.5x: 2000 / 0.5 = 4000ms (4 seconds per task)
// Speed 1x:   2000 / 1   = 2000ms (2 seconds per task)
// Speed 2x:   2000 / 2   = 1000ms (1 second per task)
```

### Animation State Flow
```
Initial: currentStep = 0, isPlaying = false

User clicks Play:
├─ isPlaying = true
├─ useEffect starts interval
├─ Every N milliseconds:
│  ├─ currentStep increment
│  ├─ Checks if at end
│  └─ Auto-stop if at end
│
User clicks Pause:
├─ isPlaying = false
└─ useEffect clears interval

User clicks Step Forward:
├─ currentStep = min(currentStep + 1, length - 1)
└─ No change to isPlaying

User clicks Step Backward:
├─ currentStep = max(currentStep - 1, 0)
└─ No change to isPlaying

Speed Change:
├─ Clears old interval
├─ Recalculates interval
└─ Restarts with new speed
```

## Component State Structure

```javascript
// State at runtime example:
{
  currentStep: 2,                    // Showing task at index 2
  isPlaying: true,                   // Animation is running
  speed: 1,                          // Normal speed (0.5, 1, or 2)
  hoveredTask: null,                 // No task currently hovered
  containerRef: HTMLDivElement,      // DOM reference
  intervalRef: 1234                  // Interval ID for cleanup
}
```

## Key Code Snippets

### Animation Loop Implementation
```javascript
useEffect(() => {
  if (!isPlaying) return;

  const baseInterval = 2000;
  const interval = baseInterval / speed;

  intervalRef.current = setInterval(() => {
    setCurrentStep((prevStep) => {
      const nextStep = prevStep + 1;
      if (nextStep >= selectedPlan.task_timeline.length) {
        setIsPlaying(false);
        return prevStep;
      }
      return nextStep;
    });
  }, interval);

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, [isPlaying, speed, selectedPlan.task_timeline.length]);
```

### Event Handler Examples
```javascript
// Play/Pause
const handlePlayPause = () => {
  setIsPlaying(!isPlaying);
};

// Step Forward (capped at end)
const handleStepForward = () => {
  setCurrentStep(
    Math.min(selectedPlan.task_timeline.length - 1, currentStep + 1)
  );
};

// Step Backward (capped at start)
const handleStepBackward = () => {
  setCurrentStep(Math.max(0, currentStep - 1));
};

// Speed Change
const handleSpeedChange = (e) => {
  setSpeed(parseFloat(e.target.value));
};
```

### Status Display Logic
```javascript
// Get current task
const currentTask = selectedPlan.task_timeline[currentStep];

// Calculate total time
const totalTurnaround = 
  selectedPlan.task_timeline[selectedPlan.task_timeline.length - 1]?.end_minute || 0;

// Calculate progress
const progressPercentage = 
  ((currentStep + 1) / selectedPlan.task_timeline.length) * 100;

// Check boundaries
const isFirstStep = currentStep === 0;
const isLastStep = currentStep === selectedPlan.task_timeline.length - 1;
```

### Validation Example
```javascript
if (!selectedPlan?.task_timeline || selectedPlan.task_timeline.length === 0) {
  return (
    <div className="bg-aero-dark rounded-lg p-6 text-center border border-gray-700">
      <p className="text-gray-500">No task timeline available</p>
    </div>
  );
}
```

### Delay Panel Rendering
```javascript
{delayData.cascadeChain.length > 0 && (
  <div className="border-t border-gray-700 p-4 bg-aero-warning/5">
    <div className="text-xs text-aero-warning mb-3 flex items-center gap-2 font-medium">
      <span className="text-lg">⚠</span>
      <span>Delay Cascade Detected</span>
    </div>
    <div className="text-xs text-gray-400 space-y-1.5">
      {delayData.cascadeChain.map((cascade, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="text-gray-500">•</span>
          <span>
            <span className="text-aero-accent font-medium">
              {cascade.source}
            </span>
            {' → '}
            <span className="text-white font-medium">
              {cascade.target}
            </span>
            {': '}
            <span className="text-aero-warning">
              +{cascade.delayMinutes}m
            </span>
          </span>
        </div>
      ))}
    </div>
  </div>
)}
```

## CSS Classes Used

### Tailwind Classes Applied
```
Layout & Structure:
- bg-aero-dark          // Dark background for main container
- bg-aero-card          // Card/panel backgrounds
- rounded-lg            // Rounded corners
- border border-gray-700  // Subtle borders
- overflow-hidden       // Clip content
- flex flex-col         // Flexbox layout
- p-4, p-6              // Padding

Colors:
- bg-aero-accent        // Accent/highlight color
- text-aero-dark        // Dark text on accent
- text-aero-warning     // Warning color
- text-gray-400         // Secondary text
- text-white            // Primary text

Interactive:
- hover:bg-aero-accent/90    // Hover state
- hover:bg-gray-600          // Alternative hover
- disabled:opacity-50        // Disabled state
- disabled:cursor-not-allowed
- transition-colors          // Smooth color change

Progress Bar:
- bg-gradient-to-r           // Gradient direction
- from-aero-accent to-blue-500  // Gradient colors
- transition-all duration-300    // Smooth animation

Accessibility:
- scrollbar-thin         // Thin scrollbar styling
- role="progressbar"     // Semantic role
- aria-valuenow          // Current value
- aria-valuemin/valuemax // Range
```

## Task 4 Integration Points

### Using the Container Reference
```javascript
// Task 4 will use this ref to render SVG/Canvas
const containerRef = useRef(null);

// In JSX:
<div ref={containerRef} className="overflow-auto scrollbar-thin p-6">
  {/* Render diagram here in Task 4 */}
</div>

// In Task 4 code:
// Use containerRef.current to access the DOM element
// Use layout.tasks to position elements
// Use layout.arrows to draw connections
// Use currentStep to animate progression
```

### Available Data for Task 4
```javascript
// Layout data (from gateLayoutEngine)
const layout = useMemo(
  () => calculateLayout(selectedPlan.task_timeline),
  [selectedPlan.task_timeline]
);
// layout.tasks: { [taskId]: { position, size, color, ... } }
// layout.arrows: [{ from, to }, ...]

// Delay data (from delayCalculator)
const delayData = useMemo(
  () => calculateDelayCascade(selectedPlan.task_timeline, {}),
  [selectedPlan.task_timeline]
);
// delayData.cascadeChain: Array of { source, target, delayMinutes }
// delayData.taskImpacts: { [taskId]: delayMinutes }

// Animation state
currentStep  // Current step (0 to length-1)
isPlaying    // Whether animation is active
speed        // Speed multiplier (0.5, 1, 2)
hoveredTask  // Currently hovered task (null or taskId)
```

## Common Use Cases

### Display a Specific Plan
```javascript
function PlanViewer({ plan }) {
  return <GateDiagram selectedPlan={plan} />;
}
```

### In a Dashboard with Multiple Plans
```javascript
function Dashboard() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        {/* Plan list */}
        {plans.map(p => (
          <button onClick={() => setSelectedPlan(p)}>
            {p.plan_id}
          </button>
        ))}
      </div>
      <div className="col-span-8">
        {/* Diagram viewer */}
        <GateDiagram selectedPlan={selectedPlan} />
      </div>
    </div>
  );
}
```

### With Comparison
```javascript
function ComparisonView({ planA, planB }) {
  const [activePlan, setActivePlan] = useState('A');

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActivePlan('A')}>Plan A</button>
        <button onClick={() => setActivePlan('B')}>Plan B</button>
      </div>
      <GateDiagram 
        selectedPlan={activePlan === 'A' ? planA : planB} 
      />
    </div>
  );
}
```

## Performance Tips

1. **Memoize selectedPlan** if passing from parent:
```javascript
const memoizedPlan = useMemo(() => selectedPlan, [selectedPlan]);
```

2. **Separate concerns** - Keep plan selection in parent:
```javascript
// Parent manages plan state
// Child just renders diagram
<GateDiagram selectedPlan={selectedPlan} />
```

3. **Avoid re-renders** - Don't create plan objects inline:
```javascript
// ❌ Bad - creates new object every render
<GateDiagram selectedPlan={{ ... }} />

// ✅ Good - memoize or move to state
const [plan] = useState({ ... });
<GateDiagram selectedPlan={plan} />
```

## Debugging Tips

### Check Console for Errors
```javascript
// Add this to parent component
useEffect(() => {
  console.log('Selected plan:', selectedPlan);
  console.log('Timeline length:', selectedPlan?.task_timeline?.length);
}, [selectedPlan]);
```

### Verify Data Structure
```javascript
// Ensure task_timeline has required fields:
selectedPlan.task_timeline[0] === {
  task_id: 'refueling',
  task_name: 'Refueling',
  start_minute: 0,
  end_minute: 15,
  duration_minutes: 15,
  apu_required: false
}
```

### Test Animation Manually
1. Click Play button - animation should start
2. Click Pause button - animation should stop
3. Change speed - animation interval should update
4. Use step buttons - currentStep should change
5. Check progress bar - should update smoothly

## What's Next (Task 4)

Task 4 will add:
- SVG or Canvas rendering for task boxes
- Visual connections between tasks
- Position calculations based on time windows
- Interactive task highlighting
- Animated progression through diagram
- Resource allocation visualization

The foundation is ready - Task 4 just needs to add the visual rendering layer!
