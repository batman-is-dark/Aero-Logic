import React, { useState } from 'react';

export default function ExplainabilityPanel({ plan, k2Selection, allPlans }) {
  const [activeTab, setActiveTab] = useState('justification');

  const tabs = [
    { id: 'justification', label: 'K2 Justification' },
    { id: 'comparison', label: 'AI vs Optimizer' },
    { id: 'details', label: 'Plan Details' },
  ];

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Tabs */}
      <div className="flex bg-slate-900/50 border-b border-slate-800/50 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
              activeTab === tab.id
                ? 'text-cyan-400 bg-cyan-500/10 shadow-sm shadow-cyan-500/10'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 flex-1">
        {activeTab === 'justification' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              K2 Strategic Logic
            </h3>
            {k2Selection?.reasoning ? (
              <p className="text-slate-300 leading-relaxed text-sm font-medium italic">
                "{k2Selection.reasoning}"
              </p>
            ) : (
              <p className="text-slate-500 text-sm uppercase font-black tracking-widest">Awaiting tactical data...</p>
            )}
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              Intelligence Delta
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-900/50 border border-slate-800/50 rounded-xl group hover:border-cyan-500/30 transition-all">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">K2 Designated Protocol</p>
                <p className="text-2xl font-black text-cyan-400 italic">PLAN {k2Selection?.plan_id || 'NULL'}</p>
              </div>
              <div className="p-5 bg-slate-900/50 border border-slate-800/50 rounded-xl group hover:border-cyan-500/30 transition-all">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Efficiency Gain</p>
                <p className="text-2xl font-black text-white">
                  {allPlans.length > 1 ? `+${((k2Selection?.score - Math.min(...allPlans.map(p => p.score))).toFixed(1))}%` : 'BASELINE'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
              Metric Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Duration</p>
                <p className="text-lg font-black text-white">{plan?.turnaround_time || '0'}M</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Cascaded</p>
                <p className="text-lg font-black text-red-400">{plan?.total_delay || '0'}M</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">K2 Score</p>
                <p className="text-lg font-black text-cyan-400">{(plan?.score || 0).toFixed(1)}</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Utility</p>
                <p className="text-lg font-black text-white">{(plan?.resource_utilization || 0).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
