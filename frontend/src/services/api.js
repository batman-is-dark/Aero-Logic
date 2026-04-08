const BASE_URL = '/api';

// Transform backend plan data to frontend format
function transformPlan(plan) {
  const timeline = plan.timeline || [];
  
  // Transform timeline to task_timeline format
  const task_timeline = timeline.map((task, idx) => ({
    task_id: idx,
    task_name: task.task,
    start_minute: task.start_min,
    end_minute: (task.start_min || 0) + (task.duration_min || 0),
    duration_minutes: task.duration_min,
    parallel: task.parallel,
    category: categorizeTask(task.task),
  }));

  return {
    ...plan,
    task_timeline,
  };
}

// Categorize tasks for color coding
function categorizeTask(taskName) {
  const lowerTask = taskName.toLowerCase();
  if (lowerTask.includes('boarding') || lowerTask.includes('deplaning')) return 'Passenger';
  if (lowerTask.includes('fuel')) return 'Fuel';
  if (lowerTask.includes('cargo')) return 'Cargo';
  if (lowerTask.includes('catering') || lowerTask.includes('water') || lowerTask.includes('cleaning')) return 'Service';
  return 'Ops';
}

// Transform the full optimization response
function transformResponse(response) {
  return {
    ...response,
    plans: (response.plans || []).map(transformPlan),
    selected_plan: response.selected_plan ? transformPlan(response.selected_plan) : response.selected_plan,
  };
}

export const apiClient = {
  async getConfig() {
    const [aircraft, weather, disruptions] = await Promise.all([
      fetch(`${BASE_URL}/config/aircraft-types`).then(r => r.json()),
      fetch(`${BASE_URL}/config/weather-conditions`).then(r => r.json()),
      fetch(`${BASE_URL}/config/disruptions`).then(r => r.json()),
    ]);
    return { aircraft: aircraft.aircraft_types, weather: weather.weather_conditions, disruptions: disruptions.disruptions };
  },

  async optimize(scenarioInput) {
    // Transform frontend data to backend format
    const optimizationRequest = {
      scenario: {
        aircraft_type: scenarioInput.aircraft_type,
        gate: scenarioInput.gate,
        scheduled_departure: scenarioInput.scheduled_departure,
        weather: scenarioInput.weather_condition,
        ground_power_available: scenarioInput.ground_power_available,
        selected_tasks: scenarioInput.selected_tasks ? 
          scenarioInput.selected_tasks.map(task => ({ task_id: task, required: true })) : 
          [],
      },
      use_disruption: scenarioInput.simulate_disruption,
      disruption_name: scenarioInput.disruption_name || null,
    };

    const response = await fetch(`${BASE_URL}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(optimizationRequest),
    });
    if (!response.ok) throw new Error('Optimization failed');
    const result = await response.json();
    return transformResponse(result);
  },

  async generateScenario(params) {
    const response = await fetch(`${BASE_URL}/scenario/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Scenario generation failed');
    return response.json();
  },

  async generateDisruption(disruptionName) {
    const response = await fetch(`${BASE_URL}/scenario/disruption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruption_name: disruptionName }),
    });
    if (!response.ok) throw new Error('Disruption generation failed');
    return response.json();
  },

  async generateRandomScenario() {
    const response = await fetch(`${BASE_URL}/scenario/random`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Random scenario generation failed');
    return response.json();
  },
};
