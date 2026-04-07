import React from 'react';

export default function PlanCard({ plan, isSelected, isK2Recommended, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-aero-accent bg-aero-dark/50'
          : isK2Recommended
          ? 'border-aero-warning/60 bg-aero-dark hover:border-aero-warning'
          : 'border-gray-700 bg-aero-card hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{plan.plan_id}</h3>
          <p className="text-sm text-gray-400">{plan.plan_name || 'Optimization Plan'}</p>
        </div>

        <div className="flex gap-2">
          {isK2Recommended && !isSelected && (
            <div className="bg-aero-warning/20 border border-aero-warning px-2 py-1 rounded text-xs font-semibold text-aero-warning flex items-center gap-1">
              <span>⭐</span>
              <span>K2 RECOMMENDED</span>
            </div>
          )}

          {isSelected && (
            <div className="bg-aero-accent/20 border border-aero-accent px-2 py-1 rounded text-xs font-semibold text-aero-accent flex items-center gap-1">
              <span>✓</span>
              <span>OPTIMAL</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Turnaround Time</p>
          <p className="font-semibold text-white">{plan.turnaround_time || 'N/A'}m</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total Delay</p>
          <p className="font-semibold text-white">{plan.total_delay || '0'}m</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Score</p>
          <p className="font-semibold text-aero-accent">{(plan.score || 0).toFixed(2)}</p>
        </div>
      </div>

      {plan.reasoning && (
        <div className="mt-3 p-2 bg-aero-dark rounded text-xs text-gray-300 border-l-2 border-aero-accent">
          {plan.reasoning.substring(0, 100)}...
        </div>
      )}
    </div>
  );
}
