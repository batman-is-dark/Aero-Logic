import React, { useState } from 'react';

export default function ExplainabilityPanel({ plan, k2Selection, allPlans }) {
  const [activeTab, setActiveTab] = useState('justification');

  const tabs = [
    { id: 'justification', label: 'K2 Justification' },
    { id: 'comparison', label: 'AI vs Optimizer' },
    { id: 'details', label: 'Plan Details' },
  ];

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-aero-dark">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-aero-accent border-b-2 border-aero-accent'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 min-h-64">
        {activeTab === 'justification' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-3">Why K2 Recommends This Plan</h3>
            {k2Selection?.reasoning ? (
              <p className="text-gray-300 leading-relaxed text-sm">{k2Selection.reasoning}</p>
            ) : (
              <p className="text-gray-400 text-sm">No justification available</p>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-3">AI vs Optimizer Analysis</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">K2 Selection</p>
                <p className="font-semibold text-aero-accent">{k2Selection?.plan_id}</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Comparison Factor</p>
                <p className="font-semibold text-white">
                  {allPlans.length > 1 ? `+${((k2Selection?.score - Math.min(...allPlans.map(p => p.score))).toFixed(2))}% improvement` : 'Single plan'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Turnaround Time</p>
                <p className="font-semibold text-white">{plan?.turnaround_time || 'N/A'}m</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Total Delay</p>
                <p className="font-semibold text-white">{plan?.total_delay || '0'}m</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Score</p>
                <p className="font-semibold text-aero-accent">{(plan?.score || 0).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-1">Resource Util.</p>
                <p className="font-semibold text-white">{(plan?.resource_utilization || 0).toFixed(0)}%</p>
              </div>
            </div>
            {plan?.task_timeline && (
              <div className="p-3 bg-aero-dark rounded border border-gray-700">
                <p className="text-gray-400 mb-2">Tasks ({plan.task_timeline.length})</p>
                <div className="space-y-1">
                  {plan.task_timeline.slice(0, 5).map(t => (
                    <p key={t.task_id} className="text-xs text-gray-300">
                      • {t.task_name} ({t.duration_minutes}m)
                    </p>
                  ))}
                  {plan.task_timeline.length > 5 && (
                    <p className="text-xs text-gray-500">+ {plan.task_timeline.length - 5} more tasks</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
