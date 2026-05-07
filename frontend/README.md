# Sales Forecasting UI

Modern React + TypeScript frontend for the Sales Forecasting System.

## Features

- 🎨 **Beautiful UI** - Clean, modern interface with Tailwind CSS
- 📊 **Interactive Charts** - Line charts powered by Chart.js
- 🔍 **State Selection** - Filter and view forecasts by state
- 📈 **Model Comparison** - Compare all 4 models side-by-side with metrics
- 📋 **Forecast Tables** - View detailed 8-week predictions
- ⚠️ **Error Handling** - Display model training failures gracefully
- 🏥 **Health Status** - Check backend API connectivity

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Charting library
- **Axios** - HTTP client

## Setup

### Prerequisites

- Node.js 16+ (with npm or yarn)
- Backend API running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` to set your API URL (default: `http://localhost:8000`):

```env
VITE_API_URL=http://localhost:8000
```

## Development

Start the dev server:

```bash
npm run dev
```

The app will open at `http://localhost:3000` with hot module reloading.

## Build

Create an optimized production build:

```bash
npm run build
```

Output is in the `dist/` folder.

## Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── StateSelector.tsx
│   │   ├── ForecastChart.tsx
│   │   ├── MetricsDisplay.tsx
│   │   ├── ForecastTable.tsx
│   │   └── ErrorDisplay.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── api.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Usage

1. **Start the backend** (from project root):
   ```bash
   python -m forecasting_service.train  # Train models (if not done)
   uvicorn forecasting_service.api:app --reload
   ```

2. **Start the frontend** (from frontend/ folder):
   ```bash
   npm run dev
   ```

3. **Open browser**: http://localhost:3000

4. **Select a state** from the dropdown

5. **View**:
   - 📊 8-week forecast chart
   - 🏆 Best model (highlighted in blue)
   - 📈 Model performance metrics (RMSE, MAE, MAPE)
   - 📋 Detailed forecast table
   - ⚠️ Any model training failures

## API Integration

The frontend communicates with these backend endpoints:

- `GET /health` - Check backend status
- `GET /states` - List available states
- `GET /models/summary` - Get model metrics and best model per state
- `GET /forecast/{state}` - Get 8-week forecast for a state

All calls include error handling and user-friendly messages.

## Styling

- **Tailwind CSS** for responsive, utility-first styling
- Mobile-first design (responsive at 640px, 768px, 1024px breakpoints)
- Color scheme: Blue accent (#3b82f6) with gray neutrals
- Dark mode support ready (can be extended)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Backend Connection Error

If you see "Backend Offline", make sure:

```bash
# Terminal 1: Train models (first time only)
python -m forecasting_service.train

# Terminal 2: Start API server
uvicorn forecasting_service.api:app --reload
```

### CORS Issues

The Vite dev server proxies API calls to the backend, so CORS should not be an issue in development.

### No States Available

Ensure models have been trained:

```bash
python -m forecasting_service.train --states Alabama Arizona  # Quick test with 2 states
```

## Performance Notes

- Chart rendering optimized with Chart.js best practices
- Lazy loading of state data
- Memoization of component renders
- Efficient re-renders only when data changes

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Export forecasts to CSV/PDF
- [ ] Confidence intervals visualization
- [ ] Compare forecasts across multiple states
- [ ] Historical performance tracking
- [ ] Model retraining trigger from UI

## License

Same as parent project
