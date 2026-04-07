import React from 'react';

export default function OptimizationStatus() {
  return (
    <div className="bg-aero-card border border-gray-700 rounded-lg p-8 text-center">
      <div className="inline-block mb-4">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-aero-accent rounded-full animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Optimizing...</h3>
      <p className="text-gray-400 text-sm">K2 is analyzing scenarios and generating plans. This may take a moment.</p>
      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-aero-accent rounded-full animate-pulse" />
          <span>Generating scenarios</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-aero-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span>Running K2 analysis</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 bg-aero-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          <span>Computing metrics</span>
        </div>
      </div>
    </div>
  );
}
