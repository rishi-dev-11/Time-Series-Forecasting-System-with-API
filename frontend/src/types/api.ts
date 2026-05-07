export interface ForecastPoint {
  date: string
  prediction: number
}

export interface ForecastResponse {
  state: string
  model: string
  horizon_weeks: number
  forecast: ForecastPoint[]
}

export interface ModelMetrics {
  mae: number
  rmse: number
  mape: number
  fit_seconds?: number
}

export interface StateSummary {
  state: string
  best_model: string
  metrics: Record<string, ModelMetrics>
  failures: Record<string, string>
}

export interface HealthResponse {
  status: string
}
