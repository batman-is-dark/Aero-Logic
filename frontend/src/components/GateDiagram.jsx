import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, Activity, Zap } from 'lucide-react';

const CATEGORY_COLORS = {
  'Passenger': '#06b6d4',
  'Fuel': '#f59e0b',
  'Cargo': '#8b5cf6',
  'Service': '#10b981',
  'Ops': '#ec4899',
};

function categorizeTask(taskName) {
  if (!taskName) return 'Ops';
  const lower = String(taskName).toLowerCase();
  if (lower.includes('boarding') || lower.includes('deplaning')) return 'Passenger';
  if (lower.includes('fuel')) return 'Fuel';
  if (lower.includes('cargo') || lower.includes('baggage')) return 'Cargo';
  if (lower.includes('catering') || lower.includes('cleaning') || lower.includes('water')) return 'Service';
  return 'Ops';
}

export function GateDiagram({ selectedPlan }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);
  const scrollRef = useRef(null);

  if (!selectedPlan?.task_timeline || selectedPlan.task_timeline.length === 0) {
    return (
      <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-16 text-center border-2 border-dashed border-slate-800/50">
        <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Strategic Visualization Pending</p>
      </div>
    );
  }

  const tasks = selectedPlan.task_timeline;
  const maxTime = Math.max(...tasks.map(t => (t.start_minute || 0) + (t.duration_minutes || 0)), 0);
  
  // Animation effect
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const interval = 2000 / speed;
    intervalRef.current = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= tasks.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, tasks.length]);

  // Auto-scroll to current task
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(`[data-step="${currentStep}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepForward = () => setCurrentStep(Math.min(tasks.length - 1, currentStep + 1));
  const handleStepBackward = () => setCurrentStep(Math.max(0, currentStep - 1));

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-black text-xs uppercase tracking-wider transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={handleStepBackward}
              disabled={currentStep === 0}
              className="px-3 py-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <div className="w-px bg-slate-700/50 my-1" />
            <button
              onClick={handleStepForward}
              disabled={currentStep === tasks.length - 1}
              className="px-3 py-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="bg-slate-800/50 text-slate-300 text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-700/50"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="font-black uppercase tracking-wider">Step {currentStep + 1}/{tasks.length}</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-4 h-4" />
            <span className="font-black uppercase">{maxTime}m total</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-900/50">
        <div
          className="h-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / tasks.length) * 100}%` }}
        />
      </div>

      {/* Timeline Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-auto p-4"
        style={{ maxHeight: '500px' }}
      >
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800/50" />

          {/* Tasks */}
          <div className="space-y-2">
            {tasks.map((task, idx) => {
              const taskName = task.task_name || task.task || `Task ${task.task_id}`;
              const category = categorizeTask(taskName);
              const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Ops'];
              const startMinute = task.start_minute || 0;
              const duration = task.duration_minutes || 0;
              const endMinute = startMinute + duration;
              
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const isFuture = idx > currentStep;

              return (
                <div
                  key={idx}
                  data-step={idx}
                  className={`relative flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-cyan-500/10 border border-cyan-500/30' : 
                    isCompleted ? 'bg-slate-900/30 border border-slate-800/30' : 
                    'bg-slate-950/30 border border-transparent'
                  }`}
                >
                  {/* Timeline dot */}
                  <div 
                    className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      isActive ? 'bg-cyan-500 border-cyan-400 scale-125 shadow-[0_0_15px_#06b6d4]' :
                      isCompleted ? 'bg-green-500 border-green-400' :
                      'bg-slate-800 border-slate-600'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-cyan-400/50" />
                    )}
                  </div>

                  {/* Task info */}
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        isActive ? 'text-cyan-400' : isCompleted ? 'text-slate-500 line-through' : 'text-slate-400'
                      }`}>
                        {taskName}
                      </span>
                      {task.parallel && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded font-black uppercase">parallel</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`font-black tabular-nums ${
                        isActive ? 'text-cyan-400' : 'text-slate-500'
                      }`}>
                        T+{startMinute}m → T+{endMinute}m
                      </span>
                      <span className={`font-black ${
                        isActive ? 'text-cyan-400' : 'text-slate-600'
                      }`}>
                        {duration}m
                      </span>
                    </div>
                  </div>

                  {/* Color bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: color }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current task highlight */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Current Operation</p>
            <p className="text-sm font-bold text-white">
              {tasks[currentStep]?.task_name || tasks[currentStep]?.task || 'Unknown'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Time Window</p>
            <p className="text-sm font-black text-cyan-400">
              T+{tasks[currentStep]?.start_minute || 0}m - T+{(tasks[currentStep]?.start_minute || 0) + (tasks[currentStep]?.duration_minutes || 0)}m
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
