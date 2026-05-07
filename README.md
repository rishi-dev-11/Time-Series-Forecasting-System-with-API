# End-to-End State Sales Forecasting System

This project builds a production-style weekly sales forecasting service for the attached case study data. It trains multiple forecasting algorithms for every state, compares validation performance with a time-series split, selects the best model per state, and serves forecasts through a REST API.

## Problem

Forecast the next 8 weeks of sales for each state using historical weekly sales data.

The solution covers:

- Missing date handling by reindexing each state to a complete weekly calendar.
- Missing value handling with time interpolation plus forward/backward fill.
- Trend and seasonality through SARIMA, Prophet, lagged supervised learning, rolling statistics, and LSTM sequence learning.
- Time-series validation without leakage.
- Automatic best model selection using validation RMSE.
- REST API prediction service with FastAPI.

## Project Structure

```text
forecasting_service/
  api.py                 FastAPI service
  config.py              Paths and constants
  data.py                Data loading, cleaning, weekly regularization
  features.py            Lag, rolling, calendar, holiday features
  metrics.py             MAE, RMSE, MAPE
  smoke_test.py          Lightweight data/feature check
  train.py               Training, evaluation, model selection, registry writing
  models/
    forecasters.py       SARIMA, Prophet, XGBoost, LSTM model wrappers
  artifacts/             Generated model registry and reports
README.md                Technical documentation
VIDEO_SCRIPT.md          Video explanation and demo script
requirements.txt         Python dependencies

├── frontend/                     # Frontend (React/TypeScript)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── requirements.txt
```

## Data

Input files:

- `Forecasting Case- Study.xlsx`
- `Forecasting Case- Study.xlsx - Sheet1.csv`

Main columns:

- `State`: state name
- `Date`: weekly date
- `Total`: sales value, formatted with commas
- `Category`: dataset category, currently `Beverages`

The pipeline aggregates sales by `state` and `date`, then creates a complete `W-SAT` weekly index for each state.

## Feature Engineering

The supervised models use these mandatory features:

- Lag features: `lag_1`, `lag_7`, `lag_30`
- Rolling statistics: `rolling_mean_4`, `rolling_std_4`, `rolling_mean_8`, `rolling_std_8`, `rolling_mean_12`, `rolling_std_12`
- Calendar features: day of week, month, week of year, quarter, month start/end
- Holiday feature: US holiday flag, with a fallback seasonal flag if the `holidays` package is unavailable

The validation split always uses the most recent 8 weeks as validation data. Earlier weeks are used for training, so future information never leaks into feature creation.

## Models

The training script compares these required algorithms per state:

1. SARIMA with yearly weekly seasonality
2. Prophet with yearly seasonality
3. XGBoost with lag and rolling features
4. LSTM with a 30-week input sequence

For each state, the model with the lowest validation RMSE is retrained on the full state history and saved in the model registry.

## Setup

Create a virtual environment and install dependencies:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install --upgrade pip
pip install -r requirements.txt
```

Note: Prophet and TensorFlow can take longer to install than the other packages. Use Python 3.10 or 3.11 if your environment has compatibility issues with deep learning packages.

## Train Models

Train all states:

```powershell
python -m forecasting_service.train
```

Quick training for a small demo:

```powershell
python -m forecasting_service.train --states Alabama Arizona --lstm-epochs 5
```

Generated artifacts:

- `forecasting_service/artifacts/model_registry.joblib`
- `forecasting_service/artifacts/training_report.json`
- Optional `.keras` files if LSTM wins for any state

## Run API

```powershell
uvicorn forecasting_service.api:app --host 0.0.0.0 --port 8000
```

Open API docs:

```text
http://localhost:8000/docs
```

## API Endpoints

Health check:

```http
GET /health
```

List trained states:

```http
GET /states
```

View model comparison summary:

```http
GET /models/summary
```

Forecast a state:

```http
GET /forecast/California?horizon_weeks=8
```

Example response:

```json
{
  "state": "California",
  "model": "xgboost",
  "horizon_weeks": 8,
  "forecast": [
    {"date": "2023-07-08", "prediction": 451234567.0}
  ]
}
```

## Production Design Notes

- Training and serving are separated. Training creates artifacts; the API only loads artifacts and serves forecasts.
- Each model is wrapped behind a common `fit` and `predict` interface.
- Failed candidate models are captured in the training report, so optional dependency or convergence issues are visible.
- Time-series validation is used instead of random splitting.
- Forecasting is state-specific, because each state can have different scale, trend, and seasonality.
- The API validates state names, supports configurable horizons, and returns structured JSON responses.

## Verification

Run the smoke test:

```powershell
python -m forecasting_service.smoke_test
```

Compile source files:

```powershell
py -m py_compile forecasting_service\*.py forecasting_service\models\*.py
```


#  Frontend Setup Guide

##  Prerequisites

- **Python 3.10+** - For backend
- **Node.js 16+** - For frontend (npm or yarn)

- cd frontend

- npm install
- npm run dev

## Version 2


