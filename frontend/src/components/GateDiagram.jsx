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
  // ... existing state ...
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hoveredTask, setHoveredTask] = useState(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  // ==================== VALIDATION ====================
  if (!selectedPlan?.task_timeline || selectedPlan.task_timeline.length === 0) {
    return (
      <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-16 text-center border-2 border-dashed border-slate-800/50">
        <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Strategic Visualization Pending</p>
      </div>
    );
  }

  // ... (useMemo for layout and delayData remain same) ...

  // ==================== RENDER ====================
  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden flex flex-col shadow-2xl h-full min-h-[800px]">
      {/* ========== CONTROLS SECTION ========== */}
      <div className="p-6 border-b border-slate-800/50 space-y-5 bg-slate-900/30">
        {/* Control Buttons Row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-black hover:bg-white transition-all text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
            title={isPlaying ? 'Pause Protocol' : 'Initiate Simulation'}
          >
            {isPlaying ? (
              <>
                <span className="text-sm">⏸</span>
                <span>Pause</span>
              </>
            ) : (
              <>
                <span className="text-sm">▶</span>
                <span>Initiate</span>
              </>
            )}
          </button>

          {/* Step Controls */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={handleStepBackward}
              disabled={isFirstStep}
              className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              title="Reverse Phase"
            >
              <span>←</span>
            </button>
            <div className="w-px bg-slate-700/50 my-2" />
            <button
              onClick={handleStepForward}
              disabled={isLastStep}
              className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              title="Advance Phase"
            >
              <span>→</span>
            </button>
          </div>

          <div className="flex-1" />

          {/* Speed Selector */}
          <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-700/50">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Warp Speed:</span>
            <select
              value={speed}
              onChange={handleSpeedChange}
              className="bg-transparent text-slate-100 text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
            >
              <option value={0.5} className="bg-slate-900">0.5x</option>
              <option value={1} className="bg-slate-900">1.0x</option>
              <option value={2} className="bg-slate-900">2.0x</option>
            </select>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-950/50 rounded-2xl p-5 space-y-4 border border-slate-800/50">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Phase</span>
              <p className="text-xs font-black text-white uppercase italic tracking-wider truncate">
                {currentTask.task_name || 'N/A'}
              </p>
            </div>
            <div className="space-y-1 text-center border-x border-slate-800/50">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sync Progress</span>
              <p className="text-xs font-black text-cyan-400 tabular-nums">
                {currentStep + 1} / {selectedPlan.task_timeline.length}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Temporal Status</span>
              <p className="text-xs font-black text-white tabular-nums">
                {currentTask.end_minute}M / {totalTurnaround}M
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/50 relative">
            <div
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-700 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[glint_2s_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========== DIAGRAM CONTAINER ========== */}
      <div
        ref={containerRef}
        className="overflow-auto scrollbar-thin p-10 bg-slate-950/20 flex-1 relative"
        style={{ minHeight: '500px' }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMinYMin meet"
          className="relative z-10"
          style={{ minWidth: '1100px', minHeight: '550px' }}
        >
          {/* ... (defs, styles, arrows, task boxes remain largely same but with updated classes) ... */}
          {/* Using same logic but applying tactical styling to markers and shapes */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#334155" />
            </marker>
            {/* Same keyframes but defined here or globally */}
          </defs>

          {/* (SVG Contents - I'll keep the existing logic but update colors in my mind and in the next edit) */}
          {/* Logic is: 100 + fromTask.colIndex * 180 ... */}
          {/* I will only update the styling parts of the SVG items */}
          {layout.arrows.map((arrow, idx) => {
            const fromTask = layout.tasks[arrow.from];
            const toTask = layout.tasks[arrow.to];
            if (!fromTask || !toTask) return null;
            const x1 = 100 + fromTask.colIndex * 180 + 140 / 2;
            const y1 = 50 + fromTask.rowIndex * 120 + 50 / 2;
            const x2 = 100 + toTask.colIndex * 180;
            const y2 = 50 + toTask.rowIndex * 120 + 50 / 2;
            return (
              <line key={`arrow-${idx}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
            );
          })}

          {Object.entries(layout.tasks).map(([taskId, task]) => {
            const isActive = currentStep < selectedPlan.task_timeline.length && selectedPlan.task_timeline[currentStep].task_id === taskId;
            const isCompleted = selectedPlan.task_timeline.some((t, idx) => t.task_id === taskId && idx < currentStep);
            const boxX = 100 + task.colIndex * 180;
            const boxY = 50 + task.rowIndex * 120;
            const boxWidth = 140;
            const boxHeight = 50;
            const baseColor = task.color;
            const fillColor = isCompleted ? `${baseColor}22` : isActive ? `${baseColor}44` : `${baseColor}11`;
            const strokeColor = isActive ? '#06b6d4' : isCompleted ? '#334155' : `${baseColor}44`;
            const strokeWidth = isActive ? 2 : 1;

            return (
              <g key={`task-${taskId}`} className="transition-all duration-500">
                {isActive && (
                  <rect x={boxX - 4} y={boxY - 4} width={boxWidth + 8} height={boxHeight + 8} rx="10" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.3" className="gate-active-box-pulse" />
                )}
                <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} rx="8" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} className="transition-all duration-500" />
                <text x={boxX + boxWidth / 2} y={boxY + 20} textAnchor="middle" fontSize="9" fontWeight="900" fill={isActive ? '#fff' : '#64748b'} className="pointer-events-none uppercase tracking-tighter">
                  {task.task_name.length > 18 ? task.task_name.substring(0, 15) + '...' : task.task_name}
                </text>
                <text x={boxX + boxWidth / 2} y={boxY + 38} textAnchor="middle" fontSize="9" fontWeight="900" fill={isActive ? '#06b6d4' : '#334155'} className="pointer-events-none tabular-nums uppercase tracking-widest">
                  {task.duration_minutes}M
                </text>
              </g>
            );
          })}
          
          {/* (Delay logic) */}
          {Object.entries(layout.tasks).map(([taskId, task]) => {
            const taskDelay = delayData.taskDelays?.[taskId];
            if (!taskDelay || taskDelay.delayMinutes === 0) return null;
            const boxX = 100 + task.colIndex * 180;
            const boxY = 50 + task.rowIndex * 120;
            return (
              <g key={`delay-${taskId}`}>
                <rect x={boxX + 100} y={boxY - 15} width="35" height="14" rx="4" fill="#ef4444" />
                <text x={boxX + 117.5} y={boxY - 5} textAnchor="middle" fontSize="8" fontWeight="900" fill="#ffffff" className="pointer-events-none">+{taskDelay.delayMinutes}M</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ========== DELAY INFORMATION PANEL ========== */}
      {delayData.cascadeChain.length > 0 && (
        <div className="border-t border-red-500/20 p-5 bg-red-500/5">
          <div className="text-[10px] text-red-400 mb-4 flex items-center gap-3 font-black uppercase tracking-[0.2em]">
            <AlertTriangle className="w-4 h-4" />
            Strategic Compromise Detected
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            {delayData.cascadeChain.map((cascade, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-900/40 p-2 rounded-lg border border-slate-800/30">
                <span className="text-red-500/40">[{idx + 1}]</span>
                <span className="truncate flex-1">
                  <span className="text-slate-400">{cascade.source}</span>
                  <span className="text-slate-600 mx-2">→</span>
                  <span className="text-slate-200">{cascade.target}</span>
                </span>
                <span className="text-red-400">+{cascade.delayMinutes}M</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
