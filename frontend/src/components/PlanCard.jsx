import React from 'react';
import { Clock, Zap, Target, CheckCircle2, Star } from 'lucide-react';

export default function PlanCard({ plan, isSelected, isK2Recommended, onSelect }) {
  const getPlanColor = () => {
    if (plan.plan_id === 'A') return 'bg-cyan-500';
    if (plan.plan_id === 'B') return 'bg-blue-500';
    if (plan.plan_id === 'C') return 'bg-indigo-500';
    return 'bg-slate-600';
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-cyan-500 ring-4 ring-cyan-500/10 z-10';
    if (isK2Recommended) return 'border-cyan-500/30 hover:border-cyan-500/50';
    return 'border-slate-800/50 hover:border-slate-700';
  };

  return (
    <div
      onClick={onSelect}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 relative overflow-hidden group ${
        isSelected ? 'bg-slate-900/90 backdrop-blur-xl scale-[1.02]' : 'bg-slate-950/40 backdrop-blur-md hover:bg-slate-900/60'
      } ${getBorderColor()}`}
    >
      {/* Background Accent */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] -mr-16 -mt-16 pointer-events-none animate-pulse" />
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`${getPlanColor()} w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/10 transform group-hover:rotate-3 transition-transform`}>
            {plan.plan_id}
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tighter leading-none italic uppercase">
              {plan.plan_name || (plan.plan_id === 'A' ? 'Speed Priority' : plan.plan_id === 'B' ? 'Fuel Efficiency' : 'Balanced Logic')}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Tactical Variant</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isK2Recommended && (
            <div className="bg-cyan-500 text-slate-950 px-2.5 py-1 rounded-md text-[9px] font-black flex items-center gap-1.5 uppercase tracking-[0.1em] shadow-lg shadow-cyan-500/20">
              <Zap className="w-3 h-3 fill-current" />
              K2 Optimal
            </div>
          )}

          {isSelected && !isK2Recommended && (
            <div className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-[9px] font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-[0.1em]">
              <CheckCircle2 className="w-3 h-3" />
              Selected
            </div>
          )}
        </div>
      </div>

        <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-8">
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-500/70" /> Delay Delta
            </p>
            <div className="flex items-baseline gap-1">
              <p className={`text-2xl font-black tracking-tighter ${(plan.total_delay || plan.total_delay_minutes) === 0 ? 'text-cyan-400' : 'text-white'}`}>
                +{plan.total_delay ?? plan.total_delay_minutes ?? 0}
              </p>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">min</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-500/70" /> APU Active
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black tracking-tighter text-white">
                {plan.apu_usage ?? plan.apu_usage_minutes ?? 0}
              </p>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">min</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-cyan-500/70" /> Turnaround
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black tracking-tighter text-white">
                {(() => {
                  // ALWAYS calculate from actual timeline to get different values per plan
                  const timeline = plan.task_timeline || plan.timeline || [];
                  const maxEnd = timeline.reduce((max, t, i) => {
                    const start = t.start_minute ?? t.start_min ?? t.start ?? 0;
                    const duration = t.duration_minutes ?? t.duration_min ?? t.duration ?? 0;
                    return Math.max(max, start + duration);
                  }, 0);
                  return maxEnd > 0 ? maxEnd : 70;
                })()}
              </p>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">min</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-cyan-400" /> APU Tasks
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black tracking-tighter text-white">
                {(() => {
                  // Calculate APU tasks based on actual timeline and parallel tasks
                  const timeline = plan.task_timeline || plan.timeline || [];
                  const totalTasks = timeline.length;
                  const parallelTasks = timeline.filter(t => t.parallel === true || t.parallel === 'true').length;
                  // Estimate APU usage: tasks that typically need APU (fuel, some services)
                  const apuTasks = timeline.filter(t => {
                    const name = (t.task_name || t.task || '').toLowerCase();
                    return name.includes('fuel') || name.includes('boarding') || name.includes('cleaning') || name.includes('catering');
                  }).length;
                  return `${apuTasks}/${totalTasks}`;
                })()}
              </p>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>

      {/* Task Sequence - Show all operations */}
      <div className="space-y-3 pt-5 border-t border-slate-800/50">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Execution Sequence</p>
          <span className="text-[9px] text-cyan-500/70 font-black uppercase tracking-widest">
            {plan.task_timeline?.length || plan.timeline?.length || 0} Operations
          </span>
        </div>
        <div className="space-y-1.5">
          {(plan.task_timeline || plan.timeline || []).map((task, idx) => (
            <div key={idx} className="flex justify-between items-center group/item">
              <span className="text-[10px] font-bold text-slate-400 group-hover/item:text-slate-200 transition-colors uppercase tracking-tight flex items-center gap-2">
                <span className="text-cyan-500/50 w-4">{idx + 1}.</span>
                {task.task_name || task.task}
              </span>
              <span className="text-[9px] font-black text-slate-600 uppercase tabular-nums">
                {task.duration_minutes || task.duration_min || 0}m
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] group-hover:text-cyan-500/70 transition-colors">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
        K2 Optimal Synthesis Applied
      </div>
    </div>
  );
}
