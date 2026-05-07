import axios, { AxiosInstance } from 'axios'
import type {
  ForecastResponse,
  StateSummary,
  HealthResponse
} from '../types/api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const forecastApi = {
  health: async (): Promise<HealthResponse> => {
    const response = await apiClient.get('/health')
    return response.data
  },

  getStates: async (): Promise<string[]> => {
    const response = await apiClient.get('/states')
    return response.data
  },

  getSummary: async (): Promise<StateSummary[]> => {
    const response = await apiClient.get('/models/summary')
    return response.data
  },

  getForecast: async (state: string, horizonWeeks: number = 8): Promise<ForecastResponse> => {
    const response = await apiClient.get(`/forecast/${encodeURIComponent(state)}`, {
      params: { horizon_weeks: horizonWeeks }
    })
    return response.data
  }
}

export default apiClient
