import React from 'react';
import { 
  Plane, 
  Zap, 
  ArrowRight, 
  Cpu, 
  Database,
  Layers,
  Activity,
  ShieldCheck,
  TrendingDown,
  Clock,
  Box,
  Share2,
  ChevronRight,
  Workflow
} from 'lucide-react';

export default function LandingPage({ onStartSimulation }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30">
      {/* Enhanced Background with Brighter Blue Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full" />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.15]" 
             style={{ backgroundImage: 'radial-gradient(#334155 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Header */}
      <header className="relative z-50 flex justify-between items-center px-8 py-6 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
            <Plane className="w-6 h-6 text-slate-950" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white">AERO-LOGIC</span>
            <span className="text-[10px] text-cyan-400 font-bold tracking-[0.3em] uppercase leading-none">Intelligence v2.0</span>
          </div>
        </div>
        
        <button 
          onClick={onStartSimulation}
          className="group relative px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden transition-all hover:border-cyan-500/50"
        >
          <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform" />
          <span className="relative text-sm font-bold text-slate-300 group-hover:text-cyan-400">Launch Platform</span>
        </button>
      </header>

      {/* Hero Section with Enhanced Graphic */}
      <section className="relative z-10 pt-20 pb-32 max-w-[1400px] mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col items-start space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-widest text-cyan-500 uppercase">K2Think reasoning core active</span>
            </div>

            <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-white">
              Optimize <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                Resilience.
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Advanced turnaround decision-support for complex aviation hubs. Move beyond reactive scheduling to proactive, counterfactual strategy synthesis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStartSimulation}
                className="px-8 py-4 bg-cyan-500 text-slate-950 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-2xl shadow-cyan-500/20 flex items-center gap-3"
              >
                Launch Simulation
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all">
                System Overview
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: HIGH-DETAIL PLAN COMPARISON GRAPHIC */}
          <div className="relative">
            {/* Decorative Glows */}
            <div className="absolute -inset-10 bg-cyan-500/10 blur-[100px] rounded-full opacity-50" />
            
            <div className="relative bg-slate-950/80 backdrop-blur-xl border border-slate-800/50 p-10 rounded-[2.5rem] shadow-2xl space-y-10">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-6">
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Live Optimization Preview</h4>
                  <p className="text-[10px] text-cyan-500/70 font-bold mt-1 tracking-wider">A320neo | Gate B12 | Heavy Turbulence</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-2 bg-cyan-500 rounded-full animate-pulse" />
                  <div className="h-2 w-2 bg-slate-800 rounded-full" />
                </div>
              </div>

              {/* Bar 1: Plan A */}
              <div className="space-y-3 opacity-40 hover:opacity-60 transition-opacity">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">A</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Time-Critical Path</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">DELAY: 0m | APU: 45m</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-[2px] border border-slate-800">
                  <div className="h-full w-[72%] bg-blue-500/40 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
                </div>
              </div>

              {/* Bar 2: Plan B (HIGHLIGHTED K2) */}
              <div className="space-y-4 relative group">
                <div className="absolute -inset-x-6 -inset-y-4 bg-cyan-500/[0.03] border-y border-cyan-500/10 rounded-xl" />
                <div className="flex justify-between items-end relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      <Zap className="w-4 h-4 text-slate-950 fill-current" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-white uppercase tracking-tighter">K2 Optimal Synthesis</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest">Recommended</span>
                        <span className="text-[9px] text-cyan-500/60 font-bold uppercase tracking-widest">94.8% Rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-cyan-400 block tracking-tight">DELAY: 3m</span>
                    <span className="text-[9px] font-mono text-cyan-600 block leading-none">FUEL: -18.2%</span>
                  </div>
                </div>
                
                <div className="relative h-12 w-full bg-slate-900 rounded-xl overflow-hidden p-1 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] group-hover:border-cyan-500/50 transition-colors">
                  {/* Dynamic Progress Bar */}
                  <div className="h-full w-[94%] bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-500 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                    <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white/30 to-transparent" />
                    {/* Animated Glint */}
                    <div className="absolute top-0 bottom-0 w-20 bg-white/20 -skew-x-12 animate-[glint_3s_infinite]" />
                  </div>
                </div>

                <div className="flex items-center gap-4 px-1">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full border border-slate-950 bg-slate-800" />)}
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Trade-off verified by K2 Reasoning Engine</span>
                </div>
              </div>

              {/* Bar 3: Plan C */}
              <div className="space-y-3 opacity-40 hover:opacity-60 transition-opacity">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">C</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Eco-Balance Path</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">DELAY: 12m | APU: 5m</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-[2px] border border-slate-800">
                  <div className="h-full w-[54%] bg-indigo-500/40 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Visualization Section */}
      <section className="relative z-10 py-32 bg-slate-950/50 backdrop-blur-3xl border-y border-slate-800/50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 w-full">
          <div className="flex flex-col items-center text-center mb-24 space-y-4">
            <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Engine Logic Flow</h2>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">How Aero-Logic Thinks.</h3>
            <p className="text-slate-400 max-w-2xl">A multi-layered synthesis process that moves from raw telemetry to optimal decision-making through cognitive reasoning.</p>
          </div>

          <div className="relative">
            {/* Flowchart Connections (Desktop) */}
            <div className="hidden lg:block absolute top-[60px] left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 transition-all group-hover:bg-cyan-500/5 relative">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Database className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight">Data Ingestion</h4>
                  <p className="text-sm text-slate-500 leading-relaxed px-4">Telemetry from ADS-B, gate sensors, and weather networks are fused into a unified state.</p>
                </div>
                <div className="flex lg:hidden justify-center py-4"><ChevronRight className="w-6 h-6 text-slate-800 rotate-90" /></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-blue-500/50 transition-all group-hover:bg-blue-500/5 relative">
                  <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Workflow className="w-8 h-8 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight">Counterfactual Simulation</h4>
                  <p className="text-sm text-slate-500 leading-relaxed px-4">System 2 logic generates hundreds of 'What-If' scenarios to map the possibility space.</p>
                </div>
                <div className="flex lg:hidden justify-center py-4"><ChevronRight className="w-6 h-6 text-slate-800 rotate-90" /></div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-purple-500/50 transition-all group-hover:bg-purple-500/5 relative">
                  <div className="absolute inset-0 bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Cpu className="w-8 h-8 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight">Reasoning Core</h4>
                  <p className="text-sm text-slate-500 leading-relaxed px-4">K2Think weighs conflicting goals (Fuel vs Time) to find the globally optimal trajectory.</p>
                </div>
                <div className="flex lg:hidden justify-center py-4"><ChevronRight className="w-6 h-6 text-slate-800 rotate-90" /></div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 transition-all group-hover:bg-cyan-500/5 relative">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Share2 className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight">Strategy Delivery</h4>
                  <p className="text-sm text-slate-500 leading-relaxed px-4">Actionable plans are delivered via Gantt, Gate Diagrams, and Explainability metrics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Visualization Section */}
      <section className="relative z-10 py-32 max-w-[1400px] mx-auto px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual: Mock Dashboard Elements */}
          <div className="grid grid-cols-2 gap-6 relative">
             {/* Background glow for the grid */}
            <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full" />
            
            <div className="space-y-6 relative z-10">
              <div className="p-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency index</span>
                  <Activity className="w-3 h-3 text-cyan-500" />
                </div>
                <div className="flex items-end gap-1 h-20">
                  {[40, 60, 45, 70, 85, 65, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm relative group overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 bg-cyan-500 transition-all duration-1000" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl text-center space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Turnaround Delta</p>
                <p className="text-3xl font-black text-white">-14.2%</p>
                <div className="flex items-center justify-center gap-1 text-emerald-500 text-[10px] font-bold">
                  <TrendingDown className="w-3 h-3" /> Improvement
                </div>
              </div>
            </div>

            <div className="pt-12 space-y-6 relative z-10">
              <div className="p-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 aspect-square">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="50.2" className="text-cyan-500" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-white">80%</span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Resource Load</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Integrated Intelligence</h2>
            <h3 className="text-5xl font-black tracking-tighter text-white leading-tight">Beyond Static Dashboards.</h3>
            <p className="text-lg text-slate-400 leading-relaxed">
              Standard optimization tools give you a single answer. Aero-Logic gives you the landscape of possibilities, allowing you to choose the strategy that fits your unique operational appetite.
            </p>
            <div className="space-y-4 pt-4">
              {[
                { icon: <Clock className="w-5 h-5" />, label: "Real-time re-optimization under disruption" },
                { icon: <ShieldCheck className="w-5 h-5" />, label: "Conflict-aware task sequencing" },
                { icon: <Box className="w-5 h-5" />, label: "Hardware-accelerated reasoning core" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-500">
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-40 flex justify-center px-8">
        <div className="max-w-4xl w-full p-12 lg:p-20 rounded-[3rem] bg-gradient-to-br from-cyan-600 to-blue-700 relative overflow-hidden text-center space-y-8 shadow-[0_0_80px_rgba(6,182,212,0.2)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
          
          <h2 className="relative z-10 text-5xl lg:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9]">Ready to optimize your fleet?</h2>
          <p className="relative z-10 text-xl font-bold text-slate-900/70 max-w-xl mx-auto">Join the world's most advanced ground operations teams and start optimizing with K2Think v2 today.</p>
          
          <div className="relative z-10 pt-4">
            <button 
              onClick={onStartSimulation}
              className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4 mx-auto"
            >
              Start Simulation
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-16 px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500 p-1.5 rounded-lg">
                <Plane className="w-5 h-5 text-slate-950" fill="currentColor" />
              </div>
              <span className="text-lg font-black tracking-tighter text-white">AERO-LOGIC</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">A next-generation decision intelligence platform for aviation ground operations. Powered by K2Think reasoning technology.</p>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</h5>
            <div className="flex flex-col gap-3 text-sm text-slate-600 font-bold">
              <a href="#" className="hover:text-cyan-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-500 transition-colors">K2 Core API</a>
              <a href="#" className="hover:text-cyan-500 transition-colors">Telemetry Nodes</a>
            </div>
          </div>

          <div className="space-y-6 text-right">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</h5>
            <p className="text-[10px] text-slate-700 font-bold leading-relaxed uppercase tracking-widest">Confidential Demo Edition<br />Reserved for MBZUAI Review<br />© 2026 Aero-Logic Ops</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Global Styles */}
      <style>{`
        @keyframes glint {
          0% { left: -100%; opacity: 0; }
          20% { opacity: 0.5; }
          40% { left: 100%; opacity: 0; }
          100% { left: 100%; opacity: 0; }
        }
        ::selection {
          background: #06b6d433;
          color: #22d3ee;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

