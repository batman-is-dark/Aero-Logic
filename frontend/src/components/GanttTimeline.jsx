import React from 'react';

const COLORS = {
  'Boarding': '#3b82f6',
  'Cleaning': '#8b5cf6',
  'Fueling': '#ec4899',
  'Catering': '#f59e0b',
  'Loading': '#10b981',
  'Unloading': '#06b6d4',
  'Maintenance': '#ef4444',
  'Safety Check': '#6366f1',
};

export default function GanttTimeline({ plan }) {
  if (!plan?.task_timeline || plan.task_timeline.length === 0) {
    return <div className="text-gray-400">No tasks available</div>;
  }

  const maxTime = Math.max(...plan.task_timeline.map(t => t.end_minute || 0), 120);
  const timelineWidth = 800;
  const pixelsPerMinute = timelineWidth / maxTime;

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg p-6 overflow-x-auto">
      <div className="min-w-max">
        {/* Time axis */}
        <div className="flex items-end mb-8">
          <div className="w-32 flex-shrink-0" />
          <div className="relative" style={{ width: `${timelineWidth}px`, height: '24px' }}>
            {Array.from({ length: Math.ceil(maxTime / 30) + 1 }).map((_, i) => {
              const time = i * 30;
              const x = time * pixelsPerMinute;
              return (
                <div
                  key={i}
                  className="absolute text-xs text-gray-400"
                  style={{ left: `${x}px`, top: '8px' }}
                >
                  {time}m
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        {plan.task_timeline.map((task) => {
          const startX = (task.start_minute || 0) * pixelsPerMinute;
          const width = Math.max((task.end_minute - task.start_minute) * pixelsPerMinute, 60);
          const color = COLORS[task.task_type] || '#6b7280';

          return (
            <div key={task.task_id} className="flex items-center mb-4">
              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-medium text-white truncate">{task.task_name}</p>
                <p className="text-xs text-gray-400">{task.start_minute}m - {task.end_minute}m</p>
              </div>
              <div className="relative flex-grow" style={{ width: `${timelineWidth}px`, height: '40px' }}>
                <div
                  className="absolute h-10 rounded flex items-center px-2 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    left: `${startX}px`,
                    width: `${width}px`,
                    backgroundColor: color + '44',
                    border: `2px solid ${color}`,
                  }}
                  title={`${task.task_name}: ${task.start_minute}m - ${task.end_minute}m (${task.end_minute - task.start_minute}m)`}
                >
                  <span className="text-xs font-semibold text-white truncate">
                    {task.duration_minutes}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
