import React from 'react';

export default function ComparisonTable({ plans, selectedPlanId }) {
  if (!plans || plans.length === 0) {
    return <div className="text-gray-400">No plans to compare</div>;
  }

  const metrics = [
    { key: 'turnaround_time', label: 'Turnaround Time', suffix: 'm', lower: true },
    { key: 'total_delay', label: 'Total Delay', suffix: 'm', lower: true },
    { key: 'score', label: 'K2 Score', suffix: '', lower: false },
    { key: 'resource_utilization', label: 'Resource Util.', suffix: '%', lower: false },
  ];

  // Find best values for highlighting
  const getBestValue = (metric) => {
    const values = plans.map(p => p[metric.key]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return metric.lower ? Math.min(...values) : Math.max(...values);
  };

  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-aero-dark border-b border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-300">Plan</th>
            {metrics.map(m => (
              <th key={m.key} className="px-4 py-3 text-right font-semibold text-gray-300">
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.plan_id;
            return (
              <tr
                key={plan.plan_id}
                className={`border-b border-gray-700 ${isSelected ? 'bg-aero-accent/10' : 'hover:bg-aero-dark/50'}`}
              >
                <td className="px-4 py-3 font-medium text-white">
                  {plan.plan_id}
                  {isSelected && <span className="text-aero-accent ml-2">✓</span>}
                </td>
                {metrics.map((m) => {
                  const value = plan[m.key];
                  const bestValue = getBestValue(m);
                  const isBest = value === bestValue && bestValue !== null;
                  const displayValue = value !== null && value !== undefined
                    ? typeof value === 'number' ? value.toFixed(2) : value
                    : 'N/A';

                  return (
                    <td
                      key={m.key}
                      className={`px-4 py-3 text-right ${
                        isBest ? 'bg-green-900/30 text-green-300 font-semibold' : 'text-gray-300'
                      }`}
                    >
                      {displayValue}{m.suffix}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
