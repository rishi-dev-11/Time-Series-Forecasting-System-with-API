// import React from 'react'
// import { Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js'
// import type { ForecastPoint } from '../types/api'

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// )

// interface ForecastChartProps {
//   data: ForecastPoint[]
//   modelName: string
//   state: string
// }

// export const ForecastChart: React.FC<ForecastChartProps> = ({
//   data,
//   modelName,
//   state
// }) => {
//   if (!data || data.length === 0) {
//     return (
//       <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
//         <p className="text-gray-500">No forecast data available</p>
//       </div>
//     )
//   }

//   const chartData = {
//     labels: data.map((point) => new Date(point.date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     })),
//     datasets: [
//       {
//         label: `${modelName} - ${state}`,
//         data: data.map((point) => point.prediction),
//         borderColor: '#3b82f6',
//         backgroundColor: 'rgba(59, 130, 246, 0.1)',
//         borderWidth: 2,
//         fill: true,
//         tension: 0.4,
//         pointRadius: 5,
//         pointBackgroundColor: '#3b82f6',
//         pointBorderColor: '#fff',
//         pointBorderWidth: 2
//       }
//     ]
//   }

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top' as const
//       },
//       title: {
//         display: true,
//         text: `8-Week Sales Forecast - ${state}`,
//         font: {
//           size: 14,
//           weight: 'bold' as const
//         }
//       },
//       tooltip: {
//         mode: 'index' as const,
//         intersect: false,
//         backgroundColor: 'rgba(0, 0, 0, 0.8)',
//         padding: 12,
//         callbacks: {
//           label: (context: any) => {
//             return `Sales: $${context.parsed.y.toFixed(2)}`
//           }
//         }
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: 'Sales Amount ($)'
//         }
//       },
//       x: {
//         title: {
//           display: true,
//           text: 'Date'
//         }
//       }
//     }
//   }

//   return (
//     <div className="w-full h-80 bg-white rounded-lg border border-gray-200 p-4">
//       <Line data={chartData} options={options} />
//     </div>
//   )
// }




import React from 'react'
import { motion } from 'framer-motion'
import {
  Line
} from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'

import {
  TrendingUp
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
)

interface ForecastPoint {
  date: string
  prediction: number
  lower_bound?: number
  upper_bound?: number
}

interface ForecastChartProps {
  forecast: ForecastPoint[]
  state: string
  model: string
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecast = [],
  state,
  model
}) => {

    if (!forecast.length) {
    return null
    }

  const labels = forecast.map((point) =>
    new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  )

  const predictions = forecast.map((point) => point.prediction)

  const lowerBounds = forecast.map(
    (point) => point.lower_bound ?? point.prediction * 0.9
  )

  const upperBounds = forecast.map(
    (point) => point.upper_bound ?? point.prediction * 1.1
  )

  const data = {
    labels,

    datasets: [

      /* Upper Bound */
      {
        label: 'Upper Range',
        data: upperBounds,
        borderColor: 'rgba(96, 165, 250, 0)',
        backgroundColor: 'rgba(96, 165, 250, 0.10)',
        pointRadius: 0,
        fill: '+1',
      },

      /* Lower Bound */
      {
        label: 'Confidence Range',
        data: lowerBounds,
        borderColor: 'rgba(96, 165, 250, 0)',
        backgroundColor: 'rgba(96, 165, 250, 0.10)',
        pointRadius: 0,
        fill: false,
      },

      /* Main Forecast Line */
      {
        label: 'Forecast',
        data: predictions,

        borderColor: '#60a5fa',

        backgroundColor: 'rgba(96, 165, 250, 0.25)',

        borderWidth: 4,

        tension: 0.45,

        pointRadius: 5,

        pointHoverRadius: 8,

        pointBackgroundColor: '#ffffff',

        pointBorderColor: '#60a5fa',

        pointBorderWidth: 3,

        fill: true,
      },
    ],
  }

  const options: any = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: 'index',
      intersect: false,
    },

    plugins: {

      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',

        borderColor: 'rgba(255,255,255,0.08)',

        borderWidth: 1,

        titleColor: '#ffffff',

        bodyColor: '#cbd5e1',

        padding: 14,

        displayColors: false,

        callbacks: {
          label: (context: any) => {
            return `Forecast: ${context.parsed.y.toLocaleString()}`
          },
        },
      },
    },

    scales: {

      x: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },

        ticks: {
          color: '#94a3b8',
        },
      },

      y: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },

        ticks: {
          color: '#94a3b8',

          callback: (value: any) =>
            `${Number(value).toLocaleString()}`,
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 card-hover"
    >

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

        <div>

          <div className="flex items-center gap-3 mb-3">

            <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/20">

              <TrendingUp className="w-5 h-5 text-blue-400" />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                Forecast Projection
              </h2>

              <p className="text-slate-400 mt-1">
                Predictive sales trend analysis for {state}
              </p>

            </div>

          </div>

        </div>

        {/* Model Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20">

          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-emerald-300 font-semibold uppercase tracking-wide text-sm">
            {model}
          </span>

        </div>

      </div>

      {/* Chart */}
      <div className="h-[420px] relative">

        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />

        <Line
          data={data}
          options={options}
        />

      </div>

    </motion.div>
  )
}
