import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  ChevronDown, 
  ChevronUp, 
  Cloud, 
  AlertTriangle, 
  Zap, 
  Clock,
  Layout
} from 'lucide-react';
import { useAppConfig } from '../contexts/AppContext';
import { apiClient } from '../services/api';

export default function ScenarioPanel({ onOptimize, isLoading }) {
  const { config } = useAppConfig();
  const [showTasks, setShowTasks] = useState(false);
  const [formData, setFormData] = useState({
    aircraft_type: 'A320',
    gate: 'B12',
    scheduled_departure: '19:24',
    weather_condition: 'Clear',
    ground_power_available: true,
    simulate_disruption: false,
    disruption_name: '',
    selected_tasks: [
      'refueling', 'cargo_unload', 'cargo_load', 'boarding',
      'catering', 'cleaning', 'safety_inspection', 'door_close'
    ]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleTask = (task) => {
    setFormData(prev => ({
      ...prev,
      selected_tasks: prev.selected_tasks.includes(task)
        ? prev.selected_tasks.filter(t => t !== task)
        : [...prev.selected_tasks, task]
    }));
  };

  const handleGenerate = async () => {
    try {
      // If disruption is selected, generate disruption scenario
      if (formData.simulate_disruption && formData.disruption_name) {
        const disruptionScenario = await apiClient.generateDisruption(formData.disruption_name);
        setFormData(prev => ({
          ...prev,
          ...disruptionScenario.scenario,
          simulate_disruption: true,
          disruption_name: formData.disruption_name
        }));
      } else {
        // Otherwise generate random scenario
        const randomScenario = await apiClient.generateRandomScenario();
        setFormData(prev => ({
          ...prev,
          ...randomScenario.scenario,
          simulate_disruption: false,
          disruption_name: ''
        }));
      }
    } catch (err) {
      console.error('Failed to generate scenario:', err);
    }
  };

  if (!config) return <div className="animate-pulse bg-gray-800 h-96 rounded-xl" />;

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden sticky top-24 z-20">
      <div className="p-5 border-b border-slate-800/50 bg-gradient-to-r from-cyan-500/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
            <Layout className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase">Pre-Flight Control</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Plane className="w-3 h-3 text-cyan-500/70" /> Aircraft
            </label>
            <div className="relative group">
              <select
                name="aircraft_type"
                value={formData.aircraft_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-cyan-500/50 focus:outline-none transition-all appearance-none cursor-pointer hover:bg-slate-800/50"
              >
                {config.aircraft?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gate Assignment</label>
            <input
              type="text"
              name="gate"
              value={formData.gate}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-cyan-500/50 focus:outline-none transition-all hover:bg-slate-800/50"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3 text-cyan-500/70" /> Schedule
            </label>
            <input
              type="time"
              name="scheduled_departure"
              value={formData.scheduled_departure}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-cyan-500/50 focus:outline-none transition-all cursor-pointer hover:bg-slate-800/50"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Cloud className="w-3 h-3 text-cyan-500/70" /> Conditions
            </label>
            <div className="relative group">
              <select
                name="weather_condition"
                value={formData.weather_condition}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-cyan-500/50 focus:outline-none transition-all appearance-none cursor-pointer hover:bg-slate-800/50"
              >
                {config.weather?.map(cond => (
                  <option key={cond.name || cond} value={cond.name || cond}>{cond.name || cond}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
        </div>

        {/* Ground Power */}
        <label className="flex items-center gap-4 cursor-pointer group bg-slate-900/50 border border-slate-800/50 p-4 rounded-xl hover:bg-slate-800/50 transition-all">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              name="ground_power_available"
              checked={formData.ground_power_available}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 border border-slate-700 rounded-full peer-checked:bg-cyan-500/20 peer-checked:border-cyan-500/50 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full peer-checked:left-6 peer-checked:bg-cyan-500 transition-all shadow-sm"></div>
          </div>
          <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-[0.1em] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-500" /> External Power
          </span>
        </label>

        {/* Turnaround Tasks Dropdown */}
        <div className="space-y-3">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-5 py-4 text-[10px] font-black flex items-center justify-between hover:bg-slate-800/50 transition-all uppercase tracking-[0.2em]"
          >
            <div className="flex items-center gap-3">
              <Layout className="w-4 h-4 text-cyan-500" />
              Manifest ({formData.selected_tasks.length} Operations)
            </div>
            {showTasks ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          
          {showTasks && (
            <div className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-5 grid grid-cols-1 gap-3.5 shadow-inner">
              {[
                { id: 'refueling', name: 'Refueling Ops' },
                { id: 'cargo_unload', name: 'Cargo Extraction' },
                { id: 'cargo_load', name: 'Cargo Insertion' },
                { id: 'boarding', name: 'Pax Infiltration' },
                { id: 'catering', name: 'Logistics Supply' },
                { id: 'cleaning', name: 'Sanitation' },
                { id: 'safety_inspection', name: 'Pre-Flight Check' },
                { id: 'door_close', name: 'Seal Hatch' },
                { id: 'deice_antiice', name: 'Atmospheric Prep' },
                { id: 'power_cooling', name: 'Thermal Management' }
              ].map(task => (
                <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selected_tasks.includes(task.id)}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 cursor-pointer transition-all"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-100 transition-colors uppercase tracking-wider">{task.name}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Disruption */}
        <div className="space-y-4 pt-6 border-t border-slate-800/50">
          <label className="flex items-center gap-4 cursor-pointer group">
            <input
              type="checkbox"
              name="simulate_disruption"
              checked={formData.simulate_disruption}
              onChange={handleChange}
              className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-red-500 focus:ring-red-500/50 focus:ring-offset-0 cursor-pointer transition-all"
            />
            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500/70" /> Insert Disruption
            </span>
          </label>

          {formData.simulate_disruption && (
            <div className="relative group">
              <select
                name="disruption_name"
                value={formData.disruption_name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-red-900/30 text-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-red-500/50 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Protocol...</option>
                {config.disruptions?.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-slate-300 transition-colors" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          <button
            onClick={() => onOptimize(formData)}
            disabled={isLoading}
            className="w-full bg-cyan-500 text-slate-950 px-6 py-4 rounded-xl text-xs font-black hover:bg-white transition-all shadow-lg shadow-cyan-500/20 uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" fill="currentColor" />
                Compute Strategy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
