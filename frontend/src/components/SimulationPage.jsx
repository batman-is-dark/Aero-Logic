import React, { useState } from 'react';
import { Plane, ArrowLeft, Cpu, Activity, Layout, AlertTriangle, Zap } from 'lucide-react';
import ScenarioPanel from './ScenarioPanel';
import { apiClient } from '../services/api';
import PlanCard from './PlanCard';
import GanttTimeline from './GanttTimeline';
import ComparisonTable from './ComparisonTable';
import ExplainabilityPanel from './ExplainabilityPanel';
import OptimizationStatus from './OptimizationStatus';
import { GateDiagram } from './GateDiagram';

export default function SimulationPage({ onBackToLanding }) {
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);

  const handleOptimize = async (scenarioInput) => {
    setLoading(true);
    setError(null);
    setCurrentScenario(scenarioInput);
    try {
      const result = await apiClient.optimize(scenarioInput);
      setOptimizationResult(result);
      if (result.plans && result.plans.length > 0) {
        setSelectedPlanId(result.selected_plan?.plan_id || result.plans[0].plan_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = optimizationResult?.plans?.find(p => p.plan_id === selectedPlanId);
  const k2Selection = optimizationResult?.selected_plan?.plan_id;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30">
      <style>{`
        @keyframes glint {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-glint {
          animation: glint 3s infinite;
        }
        @keyframes pulse-border {
          0%, 100% { opacity: 1; stroke-width: 2; }
          50% { opacity: 0.5; stroke-width: 4; }
        }
        .gate-active-box-pulse {
          animation: pulse-border 1.5s ease-in-out infinite;
        }
      `}</style>
      {/* Enhanced Background with Brighter Blue Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.1]" 
             style={{ backgroundImage: 'radial-gradient(#334155 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToLanding}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500 p-1.5 rounded-lg shadow-lg shadow-cyan-500/20">
                <Plane className="w-5 h-5 text-slate-950" fill="currentColor" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">AERO-LOGIC</span>
                <div className="text-[10px] text-cyan-400 font-black tracking-[0.3em] leading-none uppercase">Tactical Deck</div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-slate-900/50 border border-slate-800/50 px-5 py-2 rounded-full backdrop-blur-md">
            <div className="relative">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping absolute inset-0" />
              <div className="w-2 h-2 bg-cyan-500 rounded-full relative" />
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">K2 Ready System</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-8 py-8 relative z-10">
        {error && (
          <div className="mb-8 p-4 bg-red-900/10 border border-red-900/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Config */}
          <div className="lg:col-span-3">
            <ScenarioPanel onOptimize={handleOptimize} isLoading={loading} />
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-9 space-y-8">
            {loading && <OptimizationStatus />}

            {!optimizationResult && !loading && (
              <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-white/5">
                <div className="bg-[#0c1421] p-6 rounded-2xl mb-6">
                  <Activity className="w-12 h-12 text-gray-700" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Awaiting Optimization</h2>
                <p className="text-gray-500 max-w-sm">
                  Configure a scenario or simulate a disruption, then run optimization to see how K2 Think V2 generates and compares counterfactual operational plans.
                </p>
                
                <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-xl">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-aero-accent">3</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Counterfactual Plans</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-aero-accent">A/B/C</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Strategy Variants</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-aero-accent">K2</div>
                    <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Reasoning Engine</div>
                  </div>
                </div>
              </div>
            )}

            {optimizationResult && (
              <>
                {/* Active Reasoning Badge & Disruption Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-aero-accent/10 border border-aero-accent/20 p-6 rounded-2xl flex items-start gap-4 shadow-xl shadow-aero-accent/5">
                    <div className="bg-aero-accent/20 p-2.5 rounded-xl text-aero-accent">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-aero-accent flex items-center gap-2">
                        K2 Reasoning Active
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Analyzing 3 counterfactual scenarios and selecting optimal operational strategy.
                      </p>
                    </div>
                  </div>

                  {currentScenario?.simulate_disruption && (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-xl shadow-red-500/5">
                      <div className="bg-red-500/20 p-2.5 rounded-xl text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                          Disruption: {currentScenario.disruption_name || 'Active Constraint'}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Operational constraints updated. Re-calculating safety margins and delay cascades.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Plan Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                      Generated Plans
                      <span className="text-[10px] bg-[#162133] border border-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase tracking-widest font-bold">K2 Think V2</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {optimizationResult.plans.map((plan) => (
                      <PlanCard
                        key={plan.plan_id}
                        plan={plan}
                        isSelected={selectedPlanId === plan.plan_id}
                        isK2Recommended={k2Selection === plan.plan_id}
                        onSelect={() => setSelectedPlanId(plan.plan_id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Visualization Tabs / Grid */}
                <div className="grid grid-cols-1 gap-8">
                  {/* Gantt Timeline */}
                  {selectedPlan && (
                    <div className="bg-[#0c1421] border border-gray-800 rounded-2xl p-6 shadow-xl">
                      <h2 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-aero-accent" />
                        Task Timeline
                      </h2>
                      <GanttTimeline plan={selectedPlan} />
                    </div>
                  )}

                  {/* Comparison & Gate Diagram in Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Comparison Table */}
                    <div className="bg-[#0c1421] border border-gray-800 rounded-2xl p-6 shadow-xl">
                      <h2 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                        <Layout className="w-5 h-5 text-blue-500" />
                        Plan Comparison
                      </h2>
                      <ComparisonTable plans={optimizationResult.plans} selectedPlanId={selectedPlanId} />
                    </div>

                    {/* K2 Explainability */}
                    <div className="bg-[#0c1421] border border-gray-800 rounded-2xl p-6 shadow-xl">
                      <h2 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-500" />
                        K2 Explainability
                      </h2>
                      <ExplainabilityPanel
                        plan={selectedPlan}
                        k2Selection={optimizationResult.selected_plan}
                        allPlans={optimizationResult.plans}
                      />
                    </div>
                  </div>

                  {/* Gate Diagram - Full Width */}
                  {selectedPlan && (
                    <div className="bg-[#0c1421] border border-gray-800 rounded-2xl p-6 shadow-xl overflow-hidden">
                      <h2 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        Gate Diagram Visualization
                      </h2>
                      <GateDiagram selectedPlan={selectedPlan} />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
