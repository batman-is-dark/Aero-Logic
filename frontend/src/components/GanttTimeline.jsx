import React from 'react';

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
  if (lower.includes('de-ice') || lower.includes('deice') || lower.includes('anti-ice')) return 'Ops';  // De-icing is specialized
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

  const tasks = plan.task_timeline;
  
  // Calculate max time from actual data
  const maxEndTime = tasks.reduce((max, t) => {
    const start = t.start_minute ?? t.start_min ?? 0;
    const duration = t.duration_minutes ?? t.duration_min ?? 0;
    return Math.max(max, start + duration);
  }, 0);
  
  const minWidth = 600;
  const pixelsPerMinute = Math.max(6, minWidth / (maxEndTime * 1.2));
  const totalWidth = Math.max(minWidth, (maxEndTime * 1.2) * pixelsPerMinute);

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50 shadow-2xl overflow-x-auto">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-3 border-b border-slate-800/50 flex-wrap items-center">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[8px] font-black text-slate-500 uppercase">{cat}</span>
          </div>
        ))}
        <div className="ml-auto text-[10px] font-black text-cyan-400">
          Total: {maxEndTime} min
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div style={{ minWidth: `${totalWidth}px` }}>
        {/* Task Rows */}
        <div className="space-y-1">
          {tasks.map((task, idx) => {
            const taskName = task.task_name || task.task || `Task ${idx}`;
            const category = categorizeTask(taskName);
            const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Ops'];
            const start = task.start_minute ?? task.start_min ?? 0;
            const duration = task.duration_minutes ?? task.duration_min ?? 0;
            const end = start + duration;
            
            const left = start * pixelsPerMinute;
            const width = Math.max(duration * pixelsPerMinute, 20);

            return (
              <div key={idx} className="flex items-center group">
                {/* Task Label */}
                <div className="w-32 flex-shrink-0 text-right pr-3">
                  <span className="text-[9px] font-bold text-slate-300 uppercase truncate block" title={taskName}>
                    {taskName}
                  </span>
                  <span className="text-[7px] text-slate-500 font-black">{duration}m</span>
                </div>
                
                {/* Timeline Bar */}
                <div className="flex-1 h-6 bg-slate-900/50 rounded relative" style={{ width: totalWidth - 140 }}>
                  <div
                    className="absolute h-full rounded-sm transition-all duration-300 group-hover:brightness-110"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}55`,
                    }}
                  >
                    {/* Duration label inside bar */}
                    {width > 25 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-slate-900/80">
                        {duration}m
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Axis */}
        <div className="flex items-center mt-3 pt-3 border-t border-slate-800/50">
          <div className="w-32 flex-shrink-0" />
          <div className="flex-1 relative" style={{ width: totalWidth - 140 }}>
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const time = Math.round(maxEndTime * pct);
              const x = time * pixelsPerMinute;
              return (
                <div
                  key={pct}
                  className="absolute text-[7px] text-slate-500 font-black"
                  style={{ left: `${x}px`, transform: 'translateX(-50%)' }}
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