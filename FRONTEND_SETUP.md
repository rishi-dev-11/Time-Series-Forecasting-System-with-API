# 🚀 Frontend & Backend Setup Guide

## Project Structure

```
pod_assign/
├── forecasting_service/          # Backend (Python/FastAPI)
│   ├── api.py                    # REST API
│   ├── train.py                  # Model training
│   ├── models/
│   ├── features.py
│   ├── data.py
│   └── artifacts/                # Generated models & reports
├── frontend/                     # Frontend (React/TypeScript)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── requirements.txt
```

## ✅ Prerequisites

- **Python 3.10+** - For backend
- **Node.js 16+** - For frontend (npm or yarn)

## 🔧 Step 1: Setup Backend

### 1a. Create Python Virtual Environment

```powershell
# Create venv
py -m venv .venv

# Activate venv
.\.venv\Scripts\Activate.ps1
```

### 1b. Install Python Dependencies

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### 1c. Train Models (First Time Only)

```powershell
python -m forecasting_service.train
```

**Quick test** (2 states, 5 epochs):
```powershell
python -m forecasting_service.train --states Alabama Arizona --lstm-epochs 5
```

> ⏱️ Full training may take 5-15 minutes depending on data size and hardware.

### 1d. Start Backend API Server

```powershell
uvicorn forecasting_service.api:app --reload --port 8000
```

✅ Backend running at: `http://localhost:8000`

**Available endpoints:**
- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs (Swagger UI)
- Summary: http://localhost:8000/models/summary

---

## 🎨 Step 2: Setup Frontend

Open a **new terminal** (keep backend running in the first one).

### 2a. Navigate to Frontend

```powershell
cd frontend
```

### 2b. Install Dependencies

```powershell
npm install
```

### 2c. Configure Environment (Optional)

The `.env.example` already has the correct defaults. Create `.env` if needed:

```powershell
cp .env.example .env
```

Edit `.env` (optional, defaults are usually fine):
```env
VITE_API_URL=http://localhost:8000
```

### 2d. Start Dev Server

```powershell
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

## 📊 Using the Dashboard

1. Open browser: **http://localhost:3000**
2. You should see the dashboard with a state selector
3. Select a state from the dropdown
4. View:
   - 📈 **Forecast Chart** - 8-week prediction visualization
   - 🏆 **Model Comparison** - All 4 models with metrics (best highlighted in blue)
   - 📊 **Metrics Cards** - RMSE, MAE, MAPE, training time
   - ⚠️ **Failures** - Any models that failed to train
   - 📋 **Forecast Table** - Detailed weekly predictions

---

## 🔄 Workflow

### Terminal 1: Backend (Keep Running)

```powershell
.\.venv\Scripts\Activate.ps1
python -m forecasting_service.train  # Run once
uvicorn forecasting_service.api:app --reload
```

### Terminal 2: Frontend (Keep Running)

```powershell
cd frontend
npm run dev
```

### Terminal 3 (Optional): Monitor/Test

```powershell
# Check health
curl http://localhost:8000/health

# List states
curl http://localhost:8000/states

# Get summary
curl http://localhost:8000/models/summary

# Forecast for Alabama
curl http://localhost:8000/forecast/Alabama
```

---

## 📦 Building for Production

### Frontend Build

```powershell
cd frontend
npm run build
```

Output: `frontend/dist/` - Ready to deploy to any static hosting

### Backend Deployment

Package the backend as Docker container (see `Dockerfile` in root):

```powershell
docker build -t forecasting-api .
docker run -p 8000:8000 forecasting-api
```

---

## 🐛 Troubleshooting

### ❌ "Backend Offline" in UI

**Solution:**
```powershell
# Make sure backend is running
uvicorn forecasting_service.api:app --reload --port 8000
```

### ❌ "No states available"

**Solution:**
```powershell
# Train models first
python -m forecasting_service.train --states Alabama Arizona --lstm-epochs 5
```

### ❌ Module not found errors (Python)

**Solution:**
```powershell
pip install -r requirements.txt
```

### ❌ npm dependencies issues

**Solution:**
```powershell
cd frontend
rm -r node_modules package-lock.json
npm install
```

### ❌ Port already in use

**Change ports:**
```powershell
# Backend on different port
uvicorn forecasting_service.api:app --port 8001

# Then in frontend/.env:
VITE_API_URL=http://localhost:8001
```

---

## 📁 Key Files Overview

**Backend:**
- `forecasting_service/api.py` - REST endpoints
- `forecasting_service/train.py` - Model training pipeline
- `forecasting_service/models/forecasters.py` - SARIMA, Prophet, XGBoost, LSTM
- `forecasting_service/artifacts/model_registry.joblib` - Trained models (generated)

**Frontend:**
- `frontend/src/App.tsx` - Main dashboard
- `frontend/src/components/` - UI components
- `frontend/src/services/api.ts` - Backend API client
- `frontend/src/types/api.ts` - TypeScript types

---

## 📚 More Information

- **Backend Docs**: See [forecasting_service/README.md](../README.md)
- **Frontend Docs**: See [frontend/README.md](./README.md)
- **FastAPI Swagger**: http://localhost:8000/docs (when running)
- **Feature Engineering**: Check `forecasting_service/features.py`

---

## 🎯 Quick Commands Reference

```powershell
# Backend
.\.venv\Scripts\Activate.ps1           # Activate venv
pip install -r requirements.txt        # Install deps
python -m forecasting_service.train    # Train models
uvicorn forecasting_service.api:app    # Start API

# Frontend
cd frontend                            # Enter frontend
npm install                            # Install deps
npm run dev                            # Dev server
npm run build                          # Production build

# Testing
curl http://localhost:8000/health
curl http://localhost:8000/states
curl http://localhost:8000/models/summary
curl "http://localhost:8000/forecast/Alabama"
```

---

Enjoy! 🎉
