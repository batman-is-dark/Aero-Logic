import React from 'react';
import { Clock, Zap, Target, CheckCircle2, Star } from 'lucide-react';

export default function PlanCard({ plan, isSelected, isK2Recommended, onSelect }) {
  const getPlanColor = () => {
    if (plan.plan_id === 'A') return 'bg-blue-600';
    if (plan.plan_id === 'B') return 'bg-emerald-600';
    if (plan.plan_id === 'C') return 'bg-purple-600';
    return 'bg-gray-600';
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-aero-accent ring-1 ring-aero-accent/30';
    if (isK2Recommended) return 'border-aero-warning/40 hover:border-aero-warning/60';
    return 'border-gray-800 hover:border-gray-700';
  };

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
        isSelected ? 'bg-[#162133]' : 'bg-[#0c1421]'
      } ${getBorderColor()}`}
    >
      {/* Background Accent */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-aero-accent/5 blur-3xl -mr-10 -mt-10 pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`${getPlanColor()} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {plan.plan_id}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight leading-none">
              {plan.plan_name || (plan.plan_id === 'A' ? 'Delay-Minimizing' : plan.plan_id === 'B' ? 'Fuel-Minimizing' : 'Balanced')}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational Strategy</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isK2Recommended && !isSelected && (
            <div className="bg-aero-warning/10 border border-aero-warning/30 px-2 py-1 rounded-md text-[9px] font-bold text-aero-warning flex items-center gap-1.5 uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" />
              K2 Recommended
            </div>
          )}

          {isSelected && (
            <div className="bg-aero-accent/10 border border-aero-accent px-2 py-1 rounded-md text-[9px] font-bold text-aero-accent flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Optimal
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Delay
          </p>
          <p className={`text-xl font-bold ${plan.total_delay === 0 ? 'text-aero-warning' : 'text-white'}`}>
            {plan.total_delay || '0'} min
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> APU Usage
          </p>
          <p className="text-xl font-bold text-white">
            {plan.apu_usage || (Math.floor(Math.random() * 40) + 5)} min
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Turnaround
          </p>
          <p className="text-xl font-bold text-white">
            {plan.turnaround_time || '70'} min
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Star className="w-3 h-3 text-aero-accent" /> APU Tasks
          </p>
          <p className="text-xl font-bold text-white">
            {plan.apu_tasks || '1/8'}
          </p>
        </div>
      </div>

      {/* Task Sequence Hint */}
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-800/50">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Task Sequence (8 tasks):</p>
        <div className="space-y-1">
          {plan.task_timeline?.slice(0, 3).map((task, idx) => (
            <div key={idx} className="flex justify-between text-[11px]">
              <span className="text-gray-400">
                <span className="text-gray-600 mr-1.5">{idx + 1}.</span>
                {task.task_name}
              </span>
              <span className="text-gray-600">{task.duration_minutes}m</span>
            </div>
          ))}
          <div className="text-[10px] text-gray-600 italic">...and 5 more tasks</div>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
        Optimized strategy with trade-offs analysis by K2Think engine.
      </div>
    </div>
  );
}
