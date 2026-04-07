# Aero-Logic

Research-grade aviation ground-operations optimizer using K2 Think V2 API with counterfactual simulation.

## Features

- **Counterfactual Simulation Engine**: Generates 3 meaningful scenario variants (Delay-Minimizing, Fuel-Minimizing, Balanced)
- **K2 Think V2 Integration**: Multi-step reasoning, tradeoff analysis, decision-making under constraints
- **Decision Intelligence Layer**: Mathematical cost scoring with AI comparison
- **Gantt Timeline Visualization**: Task sequencing with overlaps and delays
- **Explainability Panel**: Tradeoff analysis, selection justification, optimizer agreement

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# or source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Copy .env.example to .env and add your K2 API key
copy .env.example .env
# Edit .env with your K2 API key

python main.py
```

The API runs at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`

## Usage

1. Open the frontend at `http://localhost:5173`
2. Configure scenario or click "Simulate Disruption"
3. Click "Run Optimization"
4. View 3 generated plans with reasoning
5. Compare plans in the Gantt timeline and table
6. Review the explainability panel for decision justification

## API Endpoints

- `GET /api/config/aircraft-types` - List aircraft types
- `GET /api/config/weather-conditions` - List weather conditions
- `GET /api/config/disruptions` - List disruption scenarios
- `POST /api/scenario/generate` - Generate base scenario
- `POST /api/scenario/disruption` - Generate disruption scenario
- `POST /api/scenario/random` - Generate random scenario
- `POST /api/optimize` - Run optimization with K2

## Architecture

```
backend/
├── main.py              # FastAPI app
├── counterfactual.py    # Scenario variant generator
├── k2_client.py         # K2 Think V2 API client
├── reasoning.py         # Prompt builder + parser
├── scoring.py           # Cost function + comparison
└── data_generator.py    # Synthetic aviation data

frontend/src/
├── App.jsx              # Main dashboard
└── components/
    ├── ScenarioPanel.jsx
    ├── PlanCard.jsx
    ├── GanttTimeline.jsx
    ├── ComparisonTable.jsx
    ├── ExplainabilityPanel.jsx
    └── OptimizationStatus.jsx
```

## Cost Function

```
cost = (delay_minutes × 0.5) + (apu_usage_minutes × 0.3)
```

Lower cost = better plan (unless AI reasoning provides compelling justification for different choice)

## K2 API Configuration

Set these in `backend/.env`:

```
K2_API_KEY=your-api-key
K2_API_URL=https://api.k2think.ai/v1/chat/completions
K2_MODEL=MBZUAI-IFM/K2-Think-v2
```

The system includes a mock fallback when no API key is configured.
