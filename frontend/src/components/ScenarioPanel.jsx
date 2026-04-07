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
      'Refueling', 'Cargo Unload', 'Cargo Load', 'Passenger Boarding',
      'Catering', 'Aircraft Cleaning', 'Safety Inspection', 'Door Closure'
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
      const randomScenario = await apiClient.generateRandomScenario();
      setFormData(prev => ({
        ...prev,
        ...randomScenario,
        simulate_disruption: !!randomScenario.disruption_name
      }));
    } catch (err) {
      console.error('Failed to generate scenario:', err);
    }
  };

  if (!config) return <div className="animate-pulse bg-gray-800 h-96 rounded-xl" />;

  return (
    <div className="bg-[#0c1421] rounded-xl border border-gray-800 shadow-2xl overflow-hidden sticky top-24">
      <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-aero-accent/5 to-transparent flex items-center gap-3">
        <div className="bg-aero-accent/10 p-2 rounded-lg text-aero-accent">
          <Layout className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight uppercase">Scenario Configuration</h2>
      </div>

      <div className="p-5 space-y-6">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Plane className="w-3 h-3" /> Aircraft Type
            </label>
            <select
              name="aircraft_type"
              value={formData.aircraft_type}
              onChange={handleChange}
              className="w-full bg-[#162133] border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:border-aero-accent focus:outline-none transition-all appearance-none cursor-pointer hover:border-gray-600"
            >
              {config.aircraft?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gate</label>
            <input
              type="text"
              name="gate"
              value={formData.gate}
              onChange={handleChange}
              className="w-full bg-[#162133] border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:border-aero-accent focus:outline-none transition-all hover:border-gray-600"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Scheduled Departure
            </label>
            <input
              type="time"
              name="scheduled_departure"
              value={formData.scheduled_departure}
              onChange={handleChange}
              className="w-full bg-[#162133] border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:border-aero-accent focus:outline-none transition-all cursor-pointer hover:border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Cloud className="w-3 h-3" /> Weather
            </label>
            <select
              name="weather_condition"
              value={formData.weather_condition}
              onChange={handleChange}
              className="w-full bg-[#162133] border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:border-aero-accent focus:outline-none transition-all appearance-none cursor-pointer hover:border-gray-600"
            >
              {config.weather?.map(cond => (
                <option key={cond.name || cond} value={cond.name || cond}>{cond.name || cond}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ground Power */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              name="ground_power_available"
              checked={formData.ground_power_available}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#162133] border border-gray-700 rounded-full peer-checked:bg-aero-accent/30 transition-all"></div>
            <div className="absolute left-1 top-1 w-3 h-3 bg-gray-500 rounded-full peer-checked:left-6 peer-checked:bg-aero-accent transition-all"></div>
          </div>
          <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Ground Power Available
          </span>
        </label>

        {/* Turnaround Tasks Dropdown */}
        <div className="space-y-2">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="w-full bg-[#162133] border border-gray-700 text-white rounded-lg px-4 py-3 text-xs font-bold flex items-center justify-between hover:border-gray-600 transition-all uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <span className="text-aero-accent">▶</span>
              Turnaround Tasks ({formData.selected_tasks.length} selected)
            </div>
            {showTasks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showTasks && (
            <div className="bg-[#162133] border border-gray-700 rounded-lg p-4 grid grid-cols-2 gap-3 shadow-inner">
              {[
                'Refueling', 'Cargo Unload', 'Cargo Load', 'Passenger Boarding',
                'Catering', 'Aircraft Cleaning', 'Safety Inspection', 'Door Closure',
                'De-ice/Anti-ice', 'Ground Power/Cooling'
              ].map(task => (
                <label key={task} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.selected_tasks.includes(task)}
                    onChange={() => toggleTask(task)}
                    className="w-4 h-4 rounded border-gray-700 bg-[#0c1421] text-aero-accent focus:ring-aero-accent cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors">{task}</span>
                    <span className="text-[8px] text-gray-600 font-medium">15-30 min</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Disruption */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="simulate_disruption"
              checked={formData.simulate_disruption}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-[#0c1421] text-red-500 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Simulate Disruption
            </span>
          </label>

          {formData.simulate_disruption && (
            <select
              name="disruption_name"
              value={formData.disruption_name}
              onChange={handleChange}
              className="w-full bg-[#162133] border border-red-900/30 text-white rounded-lg px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">Select disruption...</option>
              {config.disruptions?.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-white/10 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
            Generate
          </button>
          <button
            onClick={() => onOptimize(formData)}
            disabled={isLoading}
            className="bg-aero-accent text-[#060b13] px-4 py-3 rounded-lg text-sm font-bold hover:bg-white disabled:opacity-50 transition-all shadow-lg shadow-aero-accent/10 uppercase tracking-widest"
          >
            {isLoading ? 'Running...' : 'Run Optimization'}
          </button>
        </div>
      </div>
    </div>
  );
}
