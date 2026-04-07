import React, { useState } from 'react';
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

  const handleOptimize = async (scenarioInput) => {
    setLoading(true);
    setError(null);
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
    <div className="min-h-screen bg-aero-dark">
      {/* Header */}
      <div className="border-b border-gray-700 bg-aero-dark/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Landing</span>
          </button>
          <h1 className="text-2xl font-bold">K2Think Optimization</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <ScenarioPanel onOptimize={handleOptimize} isLoading={loading} />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3 space-y-6">
            {loading && <OptimizationStatus />}

            {optimizationResult && (
              <>
                {/* Plan Cards */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-white">Optimization Results</h2>
                  <div className="grid grid-cols-1 gap-3">
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

                {/* Gantt Timeline */}
                {selectedPlan && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Task Timeline</h2>
                    <GanttTimeline plan={selectedPlan} />
                  </div>
                )}

                {/* Comparison Table */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Plan Comparison</h2>
                  <ComparisonTable plans={optimizationResult.plans} selectedPlanId={selectedPlanId} />
                </div>

                {/* Explainability Panel */}
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">K2 Explainability</h2>
                  <ExplainabilityPanel
                    plan={selectedPlan}
                    k2Selection={optimizationResult.selected_plan}
                    allPlans={optimizationResult.plans}
                  />
                </div>

                {/* Gate Diagram */}
                {selectedPlan && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Gate Diagram</h2>
                    <GateDiagram selectedPlan={selectedPlan} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
