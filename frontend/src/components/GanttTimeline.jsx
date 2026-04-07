import React from 'react';

const CATEGORY_COLORS = {
  'Passenger': '#06b6d4',
  'Fuel': '#f59e0b',
  'Cargo': '#8b5cf6',
  'Service': '#10b981',
  'Ops': '#ec4899',
};

const TASK_CATEGORIES = {
  'Passenger Boarding': 'Passenger',
  'Refueling': 'Fuel',
  'Cargo Load': 'Cargo',
  'Cargo Unload': 'Cargo',
  'Catering': 'Service',
  'Aircraft Cleaning': 'Service',
  'Safety Inspection': 'Ops',
  'Door Closure': 'Ops',
  'De-ice/Anti-ice': 'Ops',
};

export default function GanttTimeline({ plan }) {
  if (!plan?.task_timeline || plan.task_timeline.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0c1421] rounded-2xl border border-dashed border-gray-800">
        <p className="text-gray-500 text-sm italic">Select a plan to view timeline visualization</p>
      </div>
    );
  }

  const maxTime = Math.max(...plan.task_timeline.map(t => t.end_minute || 0), 90);
  const timelineWidth = 1000;
  const pixelsPerMinute = timelineWidth / maxTime;

  return (
    <div className="bg-[#0c1421] rounded-2xl p-8 overflow-x-auto scrollbar-thin">
      <div className="min-w-[1100px] space-y-3">
        {/* Header Legend */}
        <div className="flex gap-4 mb-10 pb-6 border-b border-gray-800/50">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{cat}</span>
            </div>
          ))}
        </div>

        {/* Tasks Grid */}
        <div className="space-y-4">
          {plan.task_timeline.map((task) => {
            const category = TASK_CATEGORIES[task.task_name] || 'Ops';
            const color = CATEGORY_COLORS[category];
            const startX = (task.start_minute || 0) * pixelsPerMinute;
            const width = Math.max((task.duration_minutes || 0) * pixelsPerMinute, 40);

            return (
              <div key={task.task_id} className="grid grid-cols-[160px_1fr] items-center gap-6 group">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors tracking-tight">
                    {task.task_name}
                  </p>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                    {task.duration_minutes}m
                  </p>
                </div>
                
                <div className="relative h-4 bg-white/[0.02] rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full shadow-lg transition-all duration-500 ease-out group-hover:brightness-110"
                    style={{
                      left: `${startX}px`,
                      width: `${width}px`,
                      backgroundColor: color,
                      boxShadow: `0 0 15px ${color}33`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Axis at Bottom */}
        <div className="grid grid-cols-[160px_1fr] gap-6 mt-8 pt-4 border-t border-gray-800/30">
          <div />
          <div className="relative h-6">
            {[0, 15, 30, 45, 60, 75, 90].map((time) => {
              if (time > maxTime) return null;
              const x = time * pixelsPerMinute;
              return (
                <div
                  key={time}
                  className="absolute text-[9px] font-bold text-gray-600 tracking-tighter border-l border-gray-800/50 pl-1 h-3 flex items-end"
                  style={{ left: `${x}px` }}
                >
                  {time}m
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
