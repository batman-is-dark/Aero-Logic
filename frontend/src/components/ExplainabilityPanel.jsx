import React, { useState } from 'react';
import { Brain, Target, CheckCircle, XCircle, Clock, Zap, ArrowRight } from 'lucide-react';

export default function ExplainabilityPanel({ plan, k2Selection, allPlans }) {
  const [activeTab, setActiveTab] = useState('justification');

  const tabs = [
    { id: 'justification', label: 'K2 Justification' },
    { id: 'comparison', label: 'AI vs Optimizer' },
    { id: 'details', label: 'Plan Breakdown' },
  ];

  // Get reasoning text from k2Selection
  const getReasoningText = () => {
    if (k2Selection?.reasoning) return k2Selection.reasoning;
    if (k2Selection?.justification) return k2Selection.justification;
    if (plan?.reasoning) return plan.reasoning;
    return null;
  };

  // Get plan strategy
  const getStrategy = () => plan?.strategy || 'Unknown Strategy';
  
  // Get pros and cons from plan
  const getPros = () => plan?.tradeoffs?.pros || [];
  const getCons = () => plan?.tradeoffs?.cons || [];

  // Get K2 recommendation
  const getRecommendation = () => {
    const recommended = k2Selection?.plan_id || plan?.plan_id;
    return recommended;
  };

  // Calculate efficiency gain
  const calcEfficiencyGain = () => {
    if (!allPlans || allPlans.length < 2 || !k2Selection) return 'N/A';
    const scores = allPlans.map(p => p.score || 0).filter(s => typeof s === 'number' && !isNaN(s));
    if (scores.length < 2) return 'N/A';
    const minScore = Math.min(...scores);
    const k2Score = k2Selection.score || plan?.score || 0;
    if (typeof k2Score !== 'number' || isNaN(k2Score)) return 'N/A';
    const gain = k2Score - minScore;
    return gain > 0 ? `+${gain.toFixed(0)}%` : '0%';
  };

  // Get operational summary
  const getOperationalSummary = () => {
    const strategy = getStrategy();
    const pros = getPros();
    const cons = getCons();
    
    if (strategy.includes('Delay')) {
      return {
        approach: 'Speed-Optimized Operations',
        description: 'This plan prioritizes quick turnaround using parallel task execution. Ground crews work simultaneously on multiple fronts to minimize gate time.',
        keyAction: 'Maximum parallel operations enabled',
        tradeoff: 'Higher resource utilization for faster departure'
      };
    } else if (strategy.includes('Fuel')) {
      return {
        approach: 'Cost-Optimized Operations', 
        description: 'This plan minimizes fuel burn by reducing APU runtime and using ground power. Operations proceed sequentially to optimize fuel efficiency.',
        keyAction: 'Ground power priority, sequential ops',
        tradeoff: 'Longer turnaround for cost savings'
      };
    } else {
      return {
        approach: 'Balanced Operations',
        description: 'This plan balances speed and cost by selectively parallelizing critical path tasks while managing fuel consumption.',
        keyAction: 'Selective parallel operations',
        tradeoff: 'Moderate time and cost trade-off'
      };
    }
  };

  const summary = getOperationalSummary();

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Tabs */}
      <div className="flex bg-slate-900/50 border-b border-slate-800/50 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2 text-[9px] font-black uppercase tracking-[0.15em] transition-all rounded-lg ${
              activeTab === tab.id
                ? 'text-cyan-400 bg-cyan-500/10 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-auto">
        {/* K2 JUSTIFICATION TAB */}
        {activeTab === 'justification' && (
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <div className="w-1.5 h-4 bg-cyan-500 rounded-full" />
              Why This Plan?
            </h3>
            {getReasoningText() ? (
              <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
                <p className="text-slate-300 leading-relaxed text-xs">
                  {getReasoningText()}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                  Analyzing...
                </p>
              </div>
            )}
            
            {/* Strategy Overview */}
            <div className="p-3 bg-cyan-900/20 border border-cyan-500/20 rounded-lg">
              <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest mb-1">Selected Approach</p>
              <p className="text-sm font-bold text-white">{summary.approach}</p>
            </div>
          </div>
        )}

        {/* AI VS OPTIMIZER TAB */}
        {activeTab === 'comparison' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              Operational Decision
            </h3>
            
            {/* K2 Selection */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest">K2 Recommendation</p>
              </div>
              <p className="text-xl font-black text-white uppercase">PLAN {getRecommendation()}</p>
              <p className="text-xs text-slate-400 mt-1">{summary.approach}</p>
            </div>

            {/* Why This Plan */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-400" />
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest">Key Action</p>
              </div>
              <p className="text-sm text-white">{summary.keyAction}</p>
            </div>

            {/* Trade-off */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-orange-400" />
                <p className="text-[9px] text-orange-400 font-black uppercase tracking-widest">Trade-off</p>
              </div>
              <p className="text-sm text-slate-300">{summary.tradeoff}</p>
            </div>

            {/* Pros */}
            <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-[9px] text-green-400 font-black uppercase tracking-widest">Advantages</p>
              </div>
              <ul className="space-y-1">
                {getPros().map((pro, idx) => (
                  <li key={idx} className="text-xs text-green-300 flex items-center gap-2">
                    <span className="text-green-500">+</span> {pro}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">Considerations</p>
              </div>
              <ul className="space-y-1">
                {getCons().map((con, idx) => (
                  <li key={idx} className="text-xs text-red-300 flex items-center gap-2">
                    <span className="text-red-500">!</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* PLAN BREAKDOWN TAB */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <div className="w-1.5 h-4 bg-slate-500 rounded-full" />
              Plan Breakdown
            </h3>

            {/* Timeline Summary */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest">Timeline</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Total Duration</p>
                  <p className="text-lg font-black text-white">
                    {plan?.turnaround_time || 
                      Math.max(...(plan?.task_timeline || plan?.timeline || []).map(t => 
                        (t.start_minute || t.start_min || 0) + (t.duration_minutes || t.duration_min || 0)
                      ), 70)} min
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Delay Impact</p>
                  <p className="text-lg font-black text-red-400">+{plan?.total_delay ?? plan?.total_delay_minutes ?? 0} min</p>
                </div>
              </div>
            </div>

            {/* Operations Count */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest">Operations</p>
              </div>
              <p className="text-lg font-black text-white">
                {plan?.task_timeline?.length || plan?.timeline?.length || 0} Tasks
              </p>
              <p className="text-xs text-slate-500">
                {plan?.apu_tasks || '3/10'} using APU
              </p>
            </div>

            {/* Strategy Details */}
            <div className="p-3 bg-slate-900/40 border border-slate-800/50 rounded-lg">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Strategy</p>
              <p className="text-sm font-bold text-white">{getStrategy()}</p>
              <p className="text-xs text-slate-400 mt-1">{summary.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
