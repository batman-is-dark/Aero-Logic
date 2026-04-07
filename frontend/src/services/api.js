const BASE_URL = '/api';

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
    const response = await fetch(`${BASE_URL}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioInput),
    });
    if (!response.ok) throw new Error('Optimization failed');
    return response.json();
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
