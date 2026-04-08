// Task library with all 10 task definitions
// Categories: refuel, cargo, service, safety, inspection
export const TASK_LIBRARY = {
  refueling: {
    id: 'refueling',
    name: 'Refueling',
    category: 'refuel',
    color: '#f59e0b', // Amber
    resource: 'fuel_truck',
  },
  cargo_unload: {
    id: 'cargo_unload',
    name: 'Cargo Unloading',
    category: 'cargo',
    color: '#8b5cf6', // Purple
    resource: 'cargo_door',
  },
  cargo_load: {
    id: 'cargo_load',
    name: 'Cargo Loading',
    category: 'cargo',
    color: '#8b5cf6', // Purple
    resource: 'cargo_door',
  },
  boarding: {
    id: 'boarding',
    name: 'Passenger Boarding',
    category: 'service',
    color: '#00d4ff', // Cyan
    resource: 'gate',
  },
  catering: {
    id: 'catering',
    name: 'Catering/Provisioning',
    category: 'service',
    color: '#10b981', // Green
    resource: 'catering_truck',
  },
  cleaning: {
    id: 'cleaning',
    name: 'Aircraft Cleaning',
    category: 'service',
    color: '#10b981', // Green
    resource: 'ground_crew',
  },
  safety_inspection: {
    id: 'safety_inspection',
    name: 'Safety Inspection',
    category: 'inspection',
    color: '#ef4444', // Red
    resource: 'inspector',
  },
  deice_antiice: {
    id: 'deice_antiice',
    name: 'De-ice/Anti-ice Treatment',
    category: 'service',
    color: '#06b6d4', // Cyan-light
    resource: 'deice_truck',
  },
  power_cooling: {
    id: 'power_cooling',
    name: 'Ground Power/Cooling Setup',
    category: 'service',
    color: '#ec4899', // Pink
    resource: 'gpu_unit',
  },
  door_close: {
    id: 'door_close',
    name: 'Door Closure & Safety Check',
    category: 'safety',
    color: '#ef4444', // Red
    resource: 'ground_crew',
  },
};

// Default task for unknowns
const DEFAULT_TASK = {
  id: 'unknown',
  name: 'Unknown Task',
  category: 'unknown',
  color: '#6b7280', // Gray
  resource: 'unassigned',
};

/**
 * Get task definition by ID
 * Supports:
 * 1. Direct match: 'refueling' -> task
 * 2. Slug normalization: 'cargo-unload' -> 'cargo_unload'
 * 3. Case-insensitive fallback
 * 4. Default to unknown task
 */
export function getTaskDef(taskId) {
  if (!taskId) {
    return DEFAULT_TASK;
  }

  // Ensure taskId is a string
  const stringTaskId = String(taskId).trim();
  if (!stringTaskId) {
    return DEFAULT_TASK;
  }

  // Try direct match first
  if (TASK_LIBRARY[stringTaskId]) {
    return TASK_LIBRARY[stringTaskId];
  }

  // Try case-insensitive
  const lowerTaskId = stringTaskId.toLowerCase();
  const directLowerMatch = Object.entries(TASK_LIBRARY).find(
    ([key]) => key.toLowerCase() === lowerTaskId
  );
  if (directLowerMatch) {
    return directLowerMatch[1];
  }

  // Try slug normalization (kebab-case to underscore)
  const normalizedId = stringTaskId.replace(/-/g, '_').toLowerCase();
  const normalizedMatch = Object.entries(TASK_LIBRARY).find(
    ([key]) => key.toLowerCase() === normalizedId
  );
  if (normalizedMatch) {
    return normalizedMatch[1];
  }

  // Fallback to default
  return DEFAULT_TASK;
}

/**
 * Get color for a task
 */
export function getTaskColor(taskId) {
  const task = getTaskDef(taskId);
  return task.color;
}

/**
 * Get resource for a task
 */
export function getTaskResource(taskId) {
  const task = getTaskDef(taskId);
  return task.resource;
}

/**
 * Check if two time windows overlap
 * Overlap condition: (A.start < B.end) AND (B.start < A.end)
 */
function tasksOverlap(task1, task2) {
  return task1.start_minute < task2.end_minute && task2.start_minute < task1.end_minute;
}

/**
 * Calculate gate layout engine with:
 * - Parallel task detection and row/colIndex assignment
 * - Arrow generation for chronological pairs
 * - Resource mapping
 */
export function calculateLayout(taskTimeline) {
  // Filter out null/undefined entries
  const timeline = (taskTimeline || []).filter((t) => t != null);

  const tasks = {};
  const rows = []; // Array of arrays, each inner array is tasks in that row
  const arrows = [];
  const resourceMap = {};

  if (timeline.length === 0) {
    return {
      tasks,
      arrows,
      resourceMap,
    };
  }

  // Step 1: Group tasks into rows based on time overlap
  // Tasks that overlap (parallel execution) go in the same row with different colIndex
  // Tasks that don't overlap can go in different rows
  timeline.forEach((timelineTask) => {
    const taskDef = getTaskDef(timelineTask.task_id);

    // Strategy: Find the first row where this task can fit
    // A task can fit in a row if it overlaps with at least one task in that row
    // OR if the row is empty
    let assignedRow = -1;

    if (rows.length === 0) {
      // No rows yet, create first one
      rows.push([]);
      assignedRow = 0;
    } else {
      // Try to find a row where this task overlaps with at least one existing task
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const overlapsWithAnyInRow = row.some((existingTaskId) => {
          const existingTask = tasks[existingTaskId];
          return tasksOverlap(existingTask, timelineTask);
        });

        if (overlapsWithAnyInRow) {
          // This task overlaps with something in this row, add it to this row
          assignedRow = rowIdx;
          break;
        }
      }

      // If no suitable row found, create new row
      if (assignedRow === -1) {
        rows.push([]);
        assignedRow = rows.length - 1;
      }
    }

    // Add task to assigned row
    rows[assignedRow].push(timelineTask.task_id);

    // Step 2: Create task object with all metadata
    const colIndex = rows[assignedRow].length - 1;
    tasks[timelineTask.task_id] = {
      id: timelineTask.task_id,
      task_name: timelineTask.task_name || taskDef.name,
      start_minute: timelineTask.start_minute,
      end_minute: timelineTask.end_minute,
      duration_minutes: timelineTask.duration_minutes,
      apu_required: timelineTask.apu_required ?? false,
      rowIndex: assignedRow,
      colIndex: colIndex,
      color: taskDef.color,
      resource: taskDef.resource,
      category: taskDef.category,
    };

    // Track resource mapping
    const resource = taskDef.resource;
    if (!resourceMap[resource]) {
      resourceMap[resource] = [];
    }
    resourceMap[resource].push(timelineTask.task_id);
  });

  // Step 3: Generate arrows for chronological pairs (task[i] -> task[i+1])
  for (let i = 0; i < timeline.length - 1; i++) {
    const task1 = timeline[i];
    const task2 = timeline[i + 1];

    // Only create arrow if tasks are sequential (non-overlapping)
    // Sequential = task1 ends at or before task2 starts
    if (task1.end_minute <= task2.start_minute) {
      arrows.push({
        from: task1.task_id,
        to: task2.task_id,
      });
    }
  }

  return {
    tasks,
    arrows,
    resourceMap,
  };
}
