// import React, { useState, useEffect } from 'react'
// import { Header } from './components/Header'
// import { StateSelector } from './components/StateSelector'
// import { ForecastChart } from './components/ForecastChart'
// import { MetricsDisplay } from './components/MetricsDisplay'
// import { ForecastTable } from './components/ForecastTable'
// import { ErrorDisplay } from './components/ErrorDisplay'
// import { forecastApi } from './services/api'
// import type { ForecastResponse, StateSummary } from './types/api'
// // import './App.css'
// import { motion } from 'framer-motion'
// import { Sidebar } from './components/Sidebar'

// function App() {
//   const [states, setStates] = useState<string[]>([])
//   const [selectedState, setSelectedState] = useState<string>('')
//   const [forecast, setForecast] = useState<ForecastResponse | null>(null)
//   const [summary, setSummary] = useState<StateSummary | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [healthStatus, setHealthStatus] = useState<'healthy' | 'error' | 'loading'>('loading')

//   // Check health and load states on mount
//   useEffect(() => {
//     const initialize = async () => {

//       try {
//         const statesList = await forecastApi.getStates()
//         setStates(statesList)
//         if (statesList.length > 0) {
//           setSelectedState(statesList[0])
//         }
//       } catch (err) {
//         setError('Failed to load states. Make sure the backend is running.')
//         setHealthStatus('error')
//       }
//     }

//     initialize()
//   }, [])

//   // Load forecast when state changes
//   useEffect(() => {
//     if (!selectedState) return

//     const loadForecast = async () => {
//       setLoading(true)
//       setError(null)
//       try {
//         const forecastData = await forecastApi.getForecast(selectedState)
//         setForecast(forecastData)

//         const allSummary = await forecastApi.getSummary()
//         const stateSummary = allSummary.find((s) => s.state === selectedState)
//         if (stateSummary) {
//           setSummary(stateSummary)
//         }
//       } catch (err) {
//         setError(`Failed to load forecast for ${selectedState}`)
//         console.error(err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     loadForecast()
//   }, [selectedState])

//   return (
//     <div className="min-h-screen text-white relative overflow-hidden">
//         <div className="min-h-screen text-white relative overflow-hidden"></div>
//         <Sidebar />
//         <div className="dashboard-glow">
//             <div className="floating-orb orb-blue" />

//             <div className="floating-orb orb-violet" />

//             <div className="floating-orb orb-cyan" />
//         </div>   
//       <Header  />

//       <main className="relative z-10 xl:ml-[290px] min-h-screen px-8 py-8">
//         {/* Controls */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="glass-card p-8 card-hover"
//         >
//           <StateSelector
//             states={states}
//             selectedState={selectedState}
//             onSelect={setSelectedState}
//             loading={loading}
//           />
//         </motion.div>

//         {/* Error Alert */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="glass-card border border-red-500/20 bg-red-500/10 p-5 text-red-200"
//          >
//             ⚠️ {error}
//           </motion.div>
//         )}

//         {/* Loading State */}
//         {loading && (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="glass-card py-16 flex flex-col items-center justify-center"
//         >

//             <div className="relative w-16 h-16">

//             <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />

//             <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" />

//             </div>

//             <p className="mt-6 text-slate-300 text-lg font-medium">
//             Generating Forecast Intelligence...
//             </p>

//         </motion.div>
//         )}

//         {/* Content */}
//         {!loading && forecast && summary && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="space-y-10"
//          >
//             {/* Chart */}
//             <div>
//               <h2 className="section-title mb-5">Forecast Visualization</h2>
//               <ForecastChart
//                 forecast={forecast.forecast}
//                 state={forecast.state}
//                 model={forecast.model}
//               />
//             </div>

//             {/* Metrics */}
//             <div>
//               <h2 className="section-title mb-5">Model Performance Metrics</h2>
//               <MetricsDisplay metrics={summary.metrics} bestModel={summary.best_model} />
//             </div>

//             {/* Failures */}
//             {Object.keys(summary.failures).length > 0 && (
//               <div>
//                 <h2 className="section-title mb-5">Training Issues</h2>
//                 <ErrorDisplay errors={summary.failures} />
//               </div>
//             )}

//             {/* Data Table */}
//             <div>
//               <h2 className="section-title mb-5">Forecast Data</h2>
//               {/* <ForecastTable data={forecast.forecast} state={forecast.state} /> */}
//               <ForecastTable forecast={forecast.forecast} />
//             </div>
//           </motion.div>
//         )}

//         {/* Empty State */}
//         {!loading && !forecast && states.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-center py-12"
//           >
//             <p className="text-gray-500 text-lg">Select a state to view forecasts</p>
//           </motion.div>
//         )}

//         {states.length === 0 && !loading && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
//             <p className="text-yellow-800 font-medium">
//               No states available. Make sure the backend is running and models have been trained.
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   )
// }

// export default App



import React, { useState, useEffect } from 'react'

import { motion } from 'framer-motion'

import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { StateSelector } from './components/StateSelector'
import { ForecastChart } from './components/ForecastChart'
import { MetricsDisplay } from './components/MetricsDisplay'
import { ForecastTable } from './components/ForecastTable'
import { ErrorDisplay } from './components/ErrorDisplay'

import { forecastApi } from './services/api'

import type {
  ForecastResponse,
  StateSummary
} from './types/api'

function App() {

  const [states, setStates] = useState<string[]>([])

  const [selectedState, setSelectedState] =
    useState<string>('')

  const [forecast, setForecast] =
    useState<ForecastResponse | null>(null)

  const [summary, setSummary] =
    useState<StateSummary | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {

    const initialize = async () => {

      try {

        const statesList =
          await forecastApi.getStates()

        setStates(statesList)

        if (statesList.length > 0) {
          setSelectedState(statesList[0])
        }

      } catch (err) {

        setError(
          'Unable to connect to forecasting services.'
        )

        console.error(err)
      }
    }

    initialize()

  }, [])

  /* =========================
     LOAD FORECAST
  ========================= */

  useEffect(() => {

    if (!selectedState) return

    const loadForecast = async () => {

      setLoading(true)

      setError(null)

      try {

        const forecastData =
          await forecastApi.getForecast(selectedState)

        setForecast(forecastData)

        const summaries =
          await forecastApi.getSummary()

        const currentSummary =
          summaries.find(
            (s) => s.state === selectedState
          ) || null

        setSummary(currentSummary)

      } catch (err) {

        setError(
          `Unable to load forecast data for ${selectedState}.`
        )

        console.error(err)

      } finally {

        setLoading(false)
      }
    }

    loadForecast()

  }, [selectedState])

  return (

    <div className="min-h-screen bg-[#020817] text-white relative overflow-hidden">

      {/* Background Atmosphere */}
      <div className="dashboard-glow">

        <div className="floating-orb orb-blue" />

        <div className="floating-orb orb-violet" />

      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <main className="relative z-10 xl:ml-[250px] min-h-screen px-6 lg:px-10 py-8">

        <div className="max-w-[1450px] mx-auto space-y-8">

          {/* Header */}
          <Header />

          {/* State Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6"
          >

            <StateSelector
              states={states}
              selectedState={selectedState}
              onSelect={setSelectedState}
              loading={loading}
            />

          </motion.div>

          {/* Error */}
          {error && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card border border-red-500/20 bg-red-500/10 p-5 text-red-200"
            >

              {error}

            </motion.div>
          )}

          {/* Loading */}
          {loading && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card py-24 flex flex-col items-center justify-center"
            >

              <div className="relative w-14 h-14">

                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />

                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" />

              </div>

              <p className="mt-6 text-slate-300 text-lg font-medium">

                Generating Forecast Intelligence...

              </p>

            </motion.div>
          )}

          {/* Dashboard Content */}
          {!loading && forecast && summary && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >

              {/* Chart */}
              <ForecastChart
                forecast={forecast.forecast}
                state={forecast.state}
                model={forecast.model}
              />

              {/* Metrics */}
              <MetricsDisplay
                metrics={summary.metrics}
                bestModel={summary.best_model}
              />

              {/* Table */}
              <ForecastTable
                forecast={forecast.forecast}
              />

              {/* Errors */}
              {Object.keys(summary.failures).length > 0 && (

                <ErrorDisplay
                  errors={summary.failures}
                />
              )}

            </motion.div>
          )}

          {/* Empty */}
          {!loading &&
            !forecast &&
            states.length > 0 && (

            <div className="glass-card py-20 text-center">

              <p className="text-slate-400 text-lg">

                Select a state to explore predictive forecasts.

              </p>

            </div>
          )}

        </div>

      </main>

    </div>
  )
}

export default App