import React from 'react';
import { 
  Plane, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Settings2, 
  Cpu, 
  Navigation,
  Activity,
  Maximize2
} from 'lucide-react';

export default function LandingPage({ onStartSimulation }) {
  return (
    <div className="min-h-screen bg-[#060b13] text-white flex flex-col font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aero-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Header/Navbar */}
      <header className="relative z-10 flex justify-between items-center px-10 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-aero-accent p-1.5 rounded-lg shadow-lg shadow-aero-accent/20">
            <Plane className="w-6 h-6 text-[#060b13]" fill="currentColor" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">AERO-LOGIC</span>
            <div className="text-[10px] text-aero-accent font-semibold tracking-widest leading-none mt-0.5">
              PRECISION OPS
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-aero-accent transition-colors">Platform</a>
          <a href="#" className="hover:text-aero-accent transition-colors">Solutions</a>
          <a href="#" className="hover:text-aero-accent transition-colors">Insights</a>
          <a href="#" className="hover:text-aero-accent transition-colors">Case Studies</a>
        </nav>

        <button 
          onClick={onStartSimulation}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2 rounded-md text-sm font-semibold transition-all backdrop-blur-sm"
        >
          Partner Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-aero-accent/10 border border-aero-accent/20 px-3 py-1 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-aero-accent rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-aero-accent uppercase">
              K2 Think V2 Engine Active
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-6">
            Intelligent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-aero-accent to-blue-500">
              Ground Ops.
            </span>
          </h1>

          <p className="text-gray-400 max-w-xl text-lg md:text-xl font-normal leading-relaxed mb-10">
            Advanced decision intelligence for complex turnaround scenarios. 
            Powered by K2's counterfactual reasoning engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={onStartSimulation}
              className="bg-aero-accent text-[#060b13] px-8 py-4 rounded-md font-bold text-base hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-aero-accent/10"
            >
              Launch Simulation
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-md font-bold text-base transition-all backdrop-blur-sm">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full">
          {[
            {
              title: "Decision Intelligence",
              desc: "K2Think analyzes complex operational trade-offs across 100+ parameters.",
              icon: <Cpu className="w-6 h-6" />
            },
            {
              title: "Counterfactual Reasoning",
              desc: "Simulate 'what-if' scenarios to identify the most resilient operational path.",
              icon: <Activity className="w-6 h-6" />
            },
            {
              title: "Optimal Turnarounds",
              desc: "Minimize delays and fuel consumption while maximizing asset utilization.",
              icon: <Zap className="w-6 h-6" />
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md group hover:border-aero-accent/50 transition-all">
              <div className="bg-aero-accent/10 p-3 rounded-lg w-fit mb-6 text-aero-accent group-hover:bg-aero-accent group-hover:text-[#060b13] transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Technical Stats Section */}
        <div className="mt-24 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Plans Generated", value: "3" },
            { label: "Strategy Variants", value: "A/B/C" },
            { label: "Reasoning Engine", value: "K2Think" },
            { label: "Accuracy", value: "99.9%" }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0c1421] border border-gray-800/50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#04080e] py-10 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Plane className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tight">AERO-LOGIC</span>
          </div>
          <div className="text-xs text-gray-600 font-medium">
            © 2026 Aero-Logic Optimization Systems. Confidential Demo for MBZUAI.
          </div>
          <div className="flex gap-6 text-xs text-gray-500 font-medium">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Security</a>
            <a href="#" className="hover:text-white">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

