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

  const maxTime = Math.max(...plan.task_timeline.map(t => t.end_minute || 0), 90);
  const timelineWidth = 1000;
  const pixelsPerMinute = timelineWidth / maxTime;

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-800/50 shadow-2xl overflow-x-auto scrollbar-thin">
      <div className="min-w-[1100px] space-y-3">
        {/* Header Legend */}
        <div className="flex gap-6 mb-12 pb-8 border-b border-slate-800/50">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-sm rotate-45" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}44` }} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{cat}</span>
            </div>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="space-y-5">
          {plan.task_timeline.map((task) => {
            // Get task name and provide fallback
            const taskName = task.task_name || task.task || `Task ${task.task_id}`;
            
            // Categorize the task
            const category = categorizeTask(taskName);
            const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Ops'];
            
            // Calculate position and width
            const startMinute = task.start_minute || 0;
            const durationMinutes = task.duration_minutes || 0;
            const startX = startMinute * pixelsPerMinute;
            const width = Math.max(durationMinutes * pixelsPerMinute, 40);

            return (
              <div key={task.task_id} className="grid grid-cols-[180px_1fr] items-center gap-8 group">
                <div className="text-right">
                  <p className="text-[11px] font-black text-slate-300 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                    {taskName}
                  </p>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-0.5">
                    {durationMinutes || 0} MIN OPS
                  </p>
                </div>
                
                <div className="relative h-5 bg-slate-900/50 rounded-md border border-slate-800/30 overflow-hidden shadow-inner">
                  <div
                    className="absolute h-full rounded-sm shadow-lg transition-all duration-700 ease-out group-hover:brightness-125 relative overflow-hidden"
                    style={{
                      left: `${startX}px`,
                      width: `${width}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 20px ${color}33`,
                    }}
                  >
                    {/* Progress Shimmer/Glint effect could go here in CSS */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[glint_3s_infinite]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Axis at Bottom */}
        <div className="grid grid-cols-[180px_1fr] gap-8 mt-10 pt-6 border-t border-slate-800/50">
          <div />
          <div className="relative h-8">
            {[0, 15, 30, 45, 60, 75, 90].map((time) => {
              if (time > maxTime) return null;
              const x = time * pixelsPerMinute;
              return (
                <div
                  key={time}
                  className="absolute text-[9px] font-black text-slate-600 uppercase tracking-widest border-l border-slate-800/80 pl-2 h-4 flex items-end"
                  style={{ left: `${x}px` }}
                >
                  T+{time}M
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
