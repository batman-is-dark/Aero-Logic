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
  const maxEndTime = Math.max(...tasks.map(t => {
    const start = t.start_minute ?? t.start_min ?? 0;
    const duration = t.duration_minutes ?? t.duration_min ?? 0;
    return start + duration;
  }), 0);

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-800/50 shadow-2xl overflow-auto max-h-[500px]">
      {/* Header */}
      <div className="flex gap-3 mb-4 pb-3 border-b border-slate-800/50 flex-wrap items-center">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[8px] font-black text-slate-500 uppercase">{cat}</span>
          </div>
        ))}
        <div className="ml-auto text-[10px] font-black text-cyan-400">
          Duration: {maxEndTime} min
        </div>
      </div>

      {/* Task List - Simple vertical layout */}
      <div className="space-y-1">
        {tasks.map((task, idx) => {
          const taskName = task.task_name || task.task || `Task ${idx}`;
          const category = categorizeTask(taskName);
          const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Ops'];
          const startMinute = task.start_minute ?? task.start_min ?? 0;
          const durationMinutes = task.duration_minutes ?? task.duration_min ?? 0;
          const endMinute = startMinute + durationMinutes;
          
          // Calculate position as percentage of total time
          const startPercent = (startMinute / maxEndTime) * 100;
          const widthPercent = Math.max((durationMinutes / maxEndTime) * 100, 2);

          return (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900/30 transition-colors group">
              {/* Number */}
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                {idx + 1}
              </div>

              {/* Category color bar */}
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }} />

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-200 uppercase truncate">
                    {taskName}
                  </span>
                  {task.parallel && (
                    <span className="text-[7px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded font-black uppercase">PARALLEL</span>
                  )}
                </div>
                <div className="text-[9px] text-slate-500 font-black">
                  {startMinute}m → {endMinute}m ({durationMinutes}m)
                </div>
              </div>

              {/* Visual timeline bar */}
              <div className="w-24 h-3 bg-slate-900 rounded relative overflow-hidden">
                <div
                  className="absolute h-full rounded-sm"
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Time scale at bottom */}
      <div className="flex justify-between mt-4 pt-3 border-t border-slate-800/50">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <div key={pct} className="text-[8px] text-slate-500 font-black">
            T+{Math.round(maxEndTime * pct)}m
          </div>
        ))}
      </div>
    </div>
  );
}