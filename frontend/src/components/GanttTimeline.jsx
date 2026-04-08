import React from 'react';

const CATEGORY_COLORS = {
  'Passenger': '#06b6d4',
  'Fuel': '#f59e0b',
  'Cargo': '#8b5cf6',
  'Service': '#10b981',
  'Ops': '#ec4899',
};

// Flexible task categorization based on task name keywords
function categorizeTask(taskName) {
  if (!taskName) return 'Ops';
  const lower = String(taskName).toLowerCase();
  
  if (lower.includes('boarding') || lower.includes('deplaning') || lower.includes('disembark') || lower.includes('embark')) return 'Passenger';
  if (lower.includes('fuel') || lower.includes('refuel')) return 'Fuel';
  if (lower.includes('cargo') || lower.includes('baggage')) return 'Cargo';
  if (lower.includes('catering') || lower.includes('cleaning') || lower.includes('water') || lower.includes('service')) return 'Service';
  return 'Ops';
}

export default function GanttTimeline({ plan }) {
  if (!plan?.task_timeline || plan.task_timeline.length === 0) {
    return (
      <div className="p-16 text-center bg-slate-950/40 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-800/50">
        <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Awaiting Plan Selection</p>
      </div>
    );
  }

  // Calculate actual max time from task timeline
  const maxEndTime = Math.max(...plan.task_timeline.map(t => {
    const end = (t.start_minute || 0) + (t.duration_minutes || 0);
    return end;
  }), 0);
  
  // Add buffer (20%) for visual spacing
  const maxTime = Math.ceil(maxEndTime * 1.2);
  const pixelsPerMinute = 12; // Slightly wider for better visibility
  
  // Dynamic width based on actual timeline duration
  const timelineWidth = Math.max(800, maxTime * pixelsPerMinute + 200);

  // Generate time markers
  const timeMarkers = [];
  for (let t = 0; t <= maxTime + 15; t += 15) {
    timeMarkers.push(t);
  }

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50 shadow-2xl overflow-x-auto">
      <div style={{ width: `${timelineWidth}px`, minWidth: `${timelineWidth}px` }}>
        {/* Header Legend */}
        <div className="flex gap-4 mb-6 pb-4 border-b border-slate-800/50 flex-wrap">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">{cat}</span>
            </div>
          ))}
          <div className="ml-auto text-[9px] font-black text-cyan-400 uppercase tracking-[0.15em]">
            Total: {maxEndTime} min
          </div>
        </div>

        {/* Tasks Grid - Each task gets its own row */}
        <div className="space-y-2">
          {plan.task_timeline.map((task, idx) => {
            const taskName = task.task_name || task.task || `Task ${idx}`;
            const category = categorizeTask(taskName);
            const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Ops'];
            const startMinute = task.start_minute ?? task.start_min ?? 0;
            const durationMinutes = task.duration_minutes ?? task.duration_min ?? 0;
            const endMinute = startMinute + durationMinutes;
            const startX = startMinute * pixelsPerMinute;
            const width = Math.max(durationMinutes * pixelsPerMinute, 25);

            return (
              <div key={task.task_id ?? idx} className="grid grid-cols-[150px_1fr] items-center gap-4 group">
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-400 transition-colors uppercase truncate max-w-[140px]" title={taskName}>
                    {taskName}
                  </p>
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.1em]">
                    {startMinute}-{endMinute}m ({durationMinutes}m)
                  </p>
                </div>
                
                <div className="relative h-6 bg-slate-900/50 rounded border border-slate-800/30 overflow-visible">
                  <div
                    className="absolute h-full rounded-sm transition-all duration-300 group-hover:brightness-125"
                    style={{
                      left: `${startX}px`,
                      width: `${width}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}66`,
                      minWidth: '4px',
                    }}
                  />
                  {/* Show time markers on the bar for very short durations */}
                  {durationMinutes > 0 && (
                    <span 
                      className="absolute top-1/2 -translate-y-1/2 text-[6px] font-black text-slate-900/70 pointer-events-none"
                      style={{ left: `${startX + width/2}px`, transform: 'translate(-50%, -50%)' }}
                    >
                      {durationMinutes}m
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Axis at Bottom */}
        <div className="grid grid-cols-[140px_1fr] gap-4 mt-6 pt-4 border-t border-slate-800/50">
          <div />
          <div className="relative h-6">
            {timeMarkers.map((time) => {
              const x = time * pixelsPerMinute;
              return (
                <div
                  key={time}
                  className="absolute text-[8px] font-black text-slate-500 uppercase tracking-widest border-l border-slate-700/50 pl-1 h-5 flex items-end"
                  style={{ left: `${x}px` }}
                >
                  T+{time}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
