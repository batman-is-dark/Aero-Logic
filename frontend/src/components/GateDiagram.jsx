import React, { useState, useMemo, useEffect, useRef } from 'react';
import { calculateLayout, getTaskColor, getTaskResource } from '../utils/gateLayoutEngine';
import { calculateDelayCascade, getDelaySeverity, getDelayIndicator } from '../utils/delayCalculator';

/**
 * GateDiagram Component
 * Main component that orchestrates the gate diagram visualization with:
 * - Animation state management (current step, playing, speed)
 * - Layout engine integration for task positioning
 * - Delay calculator integration for impact tracking
 * - Playback controls (play/pause/step/speed)
 * - Status information display (current task, progress, time)
 */
export function GateDiagram({ selectedPlan }) {
  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hoveredTask, setHoveredTask] = useState(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // ==================== VALIDATION ====================
  if (!selectedPlan?.task_timeline || selectedPlan.task_timeline.length === 0) {
    return (
      <div className="bg-aero-dark rounded-lg p-6 text-center border border-gray-700">
        <p className="text-gray-500">No task timeline available</p>
      </div>
    );
  }

  // ==================== MEMOIZED CALCULATIONS ====================
  const layout = useMemo(
    () => calculateLayout(selectedPlan.task_timeline),
    [selectedPlan.task_timeline]
  );

  const delayData = useMemo(
    () => calculateDelayCascade(selectedPlan.task_timeline, {}),
    [selectedPlan.task_timeline]
  );

  // ==================== ANIMATION LOOP EFFECT ====================
  useEffect(() => {
    if (!isPlaying) return;

    // Calculate interval based on speed
    // Speed 1x = 2000ms interval (advance every 2 seconds)
    // Speed 0.5x = 4000ms interval (slower)
    // Speed 2x = 1000ms interval (faster)
    const baseInterval = 2000; // 2 seconds
    const interval = baseInterval / speed;

    intervalRef.current = setInterval(() => {
      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;
        // Stop auto-play when reaching last task
        if (nextStep >= selectedPlan.task_timeline.length) {
          setIsPlaying(false);
          return prevStep;
        }
        return nextStep;
      });
    }, interval);

    // Cleanup interval on unmount or state change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, selectedPlan.task_timeline.length]);

  // ==================== EVENT HANDLERS ====================
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setCurrentStep(
      Math.min(selectedPlan.task_timeline.length - 1, currentStep + 1)
    );
  };

  const handleStepBackward = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleSpeedChange = (e) => {
    setSpeed(parseFloat(e.target.value));
  };

  // ==================== DERIVED VALUES ====================
  const currentTask = selectedPlan.task_timeline[currentStep];
  const totalTurnaround =
    selectedPlan.task_timeline[selectedPlan.task_timeline.length - 1]
      ?.end_minute || 0;
  const progressPercentage =
    ((currentStep + 1) / selectedPlan.task_timeline.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === selectedPlan.task_timeline.length - 1;

  // ==================== RENDER ====================
  return (
    <div className="bg-aero-dark rounded-lg border border-gray-700 overflow-hidden flex flex-col">
      {/* ========== CONTROLS SECTION ========== */}
      <div className="p-4 border-b border-gray-700 space-y-3 bg-aero-dark">
        {/* Control Buttons Row */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-aero-accent text-aero-dark rounded font-medium hover:bg-aero-accent/90 transition-colors text-sm flex items-center gap-1"
            title={isPlaying ? 'Pause animation' : 'Start animation'}
          >
            {isPlaying ? (
              <>
                <span>⏸</span>
                <span>Pause</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Backward Button */}
          <button
            onClick={handleStepBackward}
            disabled={isFirstStep}
            className="px-4 py-2 bg-gray-700 text-white rounded font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
            title="Step backward"
          >
            <span>←</span>
            <span>Step</span>
          </button>

          {/* Step Forward Button */}
          <button
            onClick={handleStepForward}
            disabled={isLastStep}
            className="px-4 py-2 bg-gray-700 text-white rounded font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
            title="Step forward"
          >
            <span>Step</span>
            <span>→</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Speed Selector */}
          <label className="text-xs text-gray-400 flex items-center gap-2">
            <span>Speed:</span>
            <select
              value={speed}
              onChange={handleSpeedChange}
              className="px-3 py-2 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-aero-accent focus:outline-none"
              title="Adjust animation speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
          </label>
        </div>

        {/* Status Bar */}
        <div className="bg-aero-card rounded p-4 text-xs space-y-2 border border-gray-700">
          {/* Current Task Name */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Current Task:</span>
            <span className="text-white font-semibold text-sm">
              {currentTask.task_name || 'Unknown Task'}
            </span>
          </div>

          {/* Progress Count */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Progress:</span>
            <span className="text-aero-accent font-semibold">
              {currentStep + 1}/{selectedPlan.task_timeline.length}
            </span>
          </div>

          {/* Time Elapsed */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium">Time Elapsed:</span>
            <span className="text-white">
              {currentTask.end_minute}m / {totalTurnaround}m
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 h-2 rounded overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-aero-accent to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* ========== DIAGRAM CONTAINER ========== */}
      <div
        ref={containerRef}
        className="overflow-auto scrollbar-thin p-6 bg-aero-card flex-1"
        style={{ height: '400px' }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1400 600"
          preserveAspectRatio="xMidYMid meet"
          style={{ minWidth: '600px', minHeight: '500px' }}
        >
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
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulse-glow {
                0%, 100% { r: 5; opacity: 0.8; }
                50% { r: 7; opacity: 1; }
              }
              .gate-active-indicator {
                animation: spin 1.5s linear infinite;
                transform-origin: center;
              }
              .gate-active-box {
                animation: pulse-glow 1.5s ease-in-out infinite;
              }
            `}</style>
          </defs>

          {/* Draw arrows first (appear behind boxes) */}
          {layout.arrows.map((arrow, idx) => {
            const fromTask = layout.tasks[arrow.from];
            const toTask = layout.tasks[arrow.to];
            
            if (!fromTask || !toTask) return null;

            // Calculate positions: x = 100 + colIndex * 180, y = 50 + rowIndex * 120
            const x1 = 100 + fromTask.colIndex * 180 + 140 / 2; // Center of box
            const y1 = 50 + fromTask.rowIndex * 120 + 50 / 2; // Center of box
            const x2 = 100 + toTask.colIndex * 180; // Left edge of next box
            const y2 = 50 + toTask.rowIndex * 120 + 50 / 2; // Center of box

            return (
              <line
                key={`arrow-${idx}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Draw task boxes */}
          {Object.entries(layout.tasks).map(([taskId, task]) => {
            const isActive = currentStep < selectedPlan.task_timeline.length &&
              selectedPlan.task_timeline[currentStep].task_id === taskId;
            const isCompleted = selectedPlan.task_timeline.some(
              (t, idx) => t.task_id === taskId && idx < currentStep
            );

            // Position: x = 100 + colIndex * 180, y = 50 + rowIndex * 120
            const boxX = 100 + task.colIndex * 180;
            const boxY = 50 + task.rowIndex * 120;
            const boxWidth = 140;
            const boxHeight = 50;

            // Color with completion state
            const baseColor = task.color;
            const fillColor = isCompleted ? baseColor + '44' : baseColor + '88'; // Semi-transparent
            const strokeColor = isActive ? '#fbbf24' : isCompleted ? '#6b7280' : baseColor;
            const strokeWidth = isActive ? 3 : 2;

            return (
              <g key={`task-${taskId}`}>
                {/* Task box */}
                <rect
                  x={boxX}
                  y={boxY}
                  width={boxWidth}
                  height={boxHeight}
                  rx="4"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />

                {/* Task name text */}
                <text
                  x={boxX + boxWidth / 2}
                  y={boxY + 18}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#ffffff"
                  className="pointer-events-none"
                >
                  {task.task_name.length > 16
                    ? task.task_name.substring(0, 13) + '...'
                    : task.task_name}
                </text>

                {/* Duration text */}
                <text
                  x={boxX + boxWidth / 2}
                  y={boxY + 38}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#d1d5db"
                  className="pointer-events-none"
                >
                  {task.duration_minutes}m
                </text>

                {/* Active task spinning indicator */}
                {isActive && (
                  <circle
                    cx={boxX + boxWidth - 12}
                    cy={boxY + 12}
                    r="5"
                    fill="#fbbf24"
                    opacity="0.8"
                    className="gate-active-indicator"
                  />
                )}
              </g>
            );
          })}

          {/* Draw delay badges if task has delay */}
          {Object.entries(layout.tasks).map(([taskId, task]) => {
            const taskDelay = delayData.taskDelays?.[taskId];
            if (!taskDelay || taskDelay.delayMinutes === 0) return null;

            const boxX = 100 + task.colIndex * 180;
            const boxY = 50 + task.rowIndex * 120;
            const boxWidth = 140;

            return (
              <g key={`delay-${taskId}`}>
                {/* Delay badge background */}
                <rect
                  x={boxX + boxWidth - 50}
                  y={boxY - 18}
                  width="48"
                  height="16"
                  rx="3"
                  fill="#ef4444"
                  opacity="0.9"
                />

                {/* Delay badge text */}
                <text
                  x={boxX + boxWidth - 26}
                  y={boxY - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                  className="pointer-events-none"
                >
                  +{taskDelay.delayMinutes}m
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ========== DELAY INFORMATION PANEL ========== */}
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
    </div>
  );
}
