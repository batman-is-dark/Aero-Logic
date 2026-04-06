/**
 * Calculate delay cascade through a task timeline
 * @param {Array} taskTimeline - Array of tasks with id, start_minute, end_minute
 * @param {Object} taskDelays - Map of task IDs to delay values in minutes
 * @returns {Object} - { taskImpacts, totalDelayMinutes, cascadeChain }
 */
export function calculateDelayCascade(taskTimeline = [], taskDelays = {}) {
  const taskImpacts = {};
  const cascadeChain = [];
  const taskIndexMap = new Map();
  const recordedCascades = new Set();

  // Build a map of task IDs to indices for fast lookup
  taskTimeline.forEach((task, index) => {
    taskIndexMap.set(task.id, index);
  });

  // Process each delayed task
  Object.entries(taskDelays).forEach(([taskId, delay]) => {
    if (!taskIndexMap.has(taskId)) {
      return; // Skip non-existent tasks
    }

    // Initialize or update this task's impact (use max if already set)
    if (!(taskId in taskImpacts)) {
      taskImpacts[taskId] = delay;
    } else {
      taskImpacts[taskId] = Math.max(taskImpacts[taskId], delay);
    }

    // Skip cascade for zero or negative delays
    if (delay <= 0) {
      return;
    }

    // Find all downstream tasks affected by this delay
    const currentIndex = taskIndexMap.get(taskId);

    // Cascade to subsequent tasks if they are sequential
    for (let i = currentIndex + 1; i < taskTimeline.length; i++) {
      const nextTask = taskTimeline[i];
      const prevTask = taskTimeline[i - 1];

      // Check if previous task blocks this task: end_minute >= next start_minute
      if (prevTask.end_minute >= nextTask.start_minute) {
        // This is a sequential/dependent task
        const incomingDelay = taskImpacts[prevTask.id] || 0;

        // Use maximum delay from all sources
        if (!(nextTask.id in taskImpacts)) {
          taskImpacts[nextTask.id] = incomingDelay;
          const cascadeKey = `${prevTask.id}->${nextTask.id}`;
          if (!recordedCascades.has(cascadeKey)) {
            cascadeChain.push({
              source: prevTask.id,
              target: nextTask.id,
              delayMinutes: incomingDelay,
            });
            recordedCascades.add(cascadeKey);
          }
        } else {
          const currentDelay = taskImpacts[nextTask.id];
          if (incomingDelay > currentDelay) {
            taskImpacts[nextTask.id] = incomingDelay;
          }
        }
      } else {
        // Tasks are parallel, cascade stops here
        break;
      }
    }
  });

  // Calculate total delay
  const totalDelayMinutes = Object.values(taskImpacts).reduce(
    (sum, delay) => sum + delay,
    0
  );

  return {
    taskImpacts,
    totalDelayMinutes,
    cascadeChain,
  };
}

/**
 * Determine the severity category for a delay
 * @param {number} delayMinutes - Number of minutes delayed
 * @returns {string} - 'on-time', 'slight-delay', or 'significant-delay'
 */
export function getDelaySeverity(delayMinutes) {
  if (delayMinutes <= 0) {
    return 'on-time';
  } else if (delayMinutes <= 5) {
    return 'slight-delay';
  } else {
    return 'significant-delay';
  }
}

/**
 * Get visual indicator for a delay severity
 * @param {number} delayMinutes - Number of minutes delayed
 * @returns {Object} - { emoji, color, label, abbreviation }
 */
export function getDelayIndicator(delayMinutes) {
  const severity = getDelaySeverity(delayMinutes);

  const indicators = {
    'on-time': {
      emoji: '✅',
      color: '#10b981', // green
      label: 'on-time',
      abbreviation: 'OT',
    },
    'slight-delay': {
      emoji: '⚠️',
      color: '#f59e0b', // amber
      label: 'slight-delay',
      abbreviation: 'SD',
    },
    'significant-delay': {
      emoji: '🔴',
      color: '#ef4444', // red
      label: 'significant-delay',
      abbreviation: 'ED',
    },
  };

  return indicators[severity];
}
