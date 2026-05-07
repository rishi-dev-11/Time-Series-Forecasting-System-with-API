// import React from 'react'
// import type { ModelMetrics } from '../types/api'

// interface MetricsDisplayProps {
//   metrics: Record<string, ModelMetrics>
//   bestModel: string
// }

// export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, bestModel }) => {
//   if (!metrics || Object.keys(metrics).length === 0) {
//     return (
//       <div className="text-gray-500 text-center py-8">No metrics available</div>
//     )
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//       {Object.entries(metrics).map(([modelName, modelMetrics]) => (
//         <div
//           key={modelName}
//           className={`rounded-lg border-2 p-4 transition-all ${
//             modelName === bestModel
//               ? 'bg-blue-50 border-blue-500 shadow-lg'
//               : 'bg-white border-gray-200'
//           }`}
//         >
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-bold text-gray-800 capitalize">{modelName}</h3>
//             {modelName === bestModel && (
//               <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
//                 Best
//               </span>
//             )}
//           </div>

//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-gray-600">RMSE:</span>
//               <span className="font-semibold text-gray-900">
//                 {modelMetrics.rmse?.toFixed(2) || 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">MAE:</span>
//               <span className="font-semibold text-gray-900">
//                 {modelMetrics.mae?.toFixed(2) || 'N/A'}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">MAPE:</span>
//               <span className="font-semibold text-gray-900">
//                 {modelMetrics.mape?.toFixed(2) || 'N/A'}%
//               </span>
//             </div>
//             {modelMetrics.fit_seconds && (
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Train Time:</span>
//                 <span className="font-semibold text-gray-900">
//                   {modelMetrics.fit_seconds.toFixed(2)}s
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }




import React from 'react'
import { motion } from 'framer-motion'

import {
  BrainCircuit,
  Activity,
  BarChart3,
  GaugeCircle,
  Sparkles,
} from 'lucide-react'

interface Metrics {
  mae: number
  rmse: number
  mape: number
  fit_seconds?: number
}

interface MetricsDisplayProps {
  metrics: Record<string, Metrics>
  bestModel: string
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics,
  bestModel,
}) => {

  const bestMetrics = metrics[bestModel]

  const cards = [
    {
      title: 'Best Forecast Engine',
      value: bestModel.toUpperCase(),
      subtitle: 'Top performing forecasting model',
      icon: BrainCircuit,
      accent: 'blue',
    },

    {
      title: 'RMSE',
      value: bestMetrics?.rmse?.toFixed(2) ?? '--',
      subtitle: 'Root Mean Squared Error',
      icon: Activity,
      accent: 'emerald',
    },

    {
      title: 'MAE',
      value: bestMetrics?.mae?.toFixed(2) ?? '--',
      subtitle: 'Mean Absolute Error',
      icon: BarChart3,
      accent: 'violet',
    },

    {
      title: 'MAPE',
      value: `${bestMetrics?.mape?.toFixed(2) ?? '--'}%`,
      subtitle: 'Forecast Error Percentage',
      icon: GaugeCircle,
      accent: 'cyan',
    },
  ]

  const accentStyles: Record<string, string> = {
    blue:
      'bg-blue-500/15 border-blue-400/20 text-blue-400',

    emerald:
      'bg-emerald-500/15 border-emerald-400/20 text-emerald-400',

    violet:
      'bg-violet-500/15 border-violet-400/20 text-violet-400',

    cyan:
      'bg-cyan-500/15 border-cyan-400/20 text-cyan-400',
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <div className="flex items-center gap-3 mb-3">

            <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-400/20">

              <Sparkles className="w-5 h-5 text-violet-400" />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                Forecast Performance Metrics
              </h2>

              <p className="text-slate-400 mt-1">
                Comparative evaluation of forecasting model accuracy
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card, index) => {

          const Icon = card.icon

          return (
            <motion.div
              key={card.title}

              initial={{
                opacity: 0,
                y: 24
              }}

              animate={{
                opacity: 1,
                y: 0
              }}

              transition={{
                delay: index * 0.08,
                duration: 0.45
              }}

              className="glass-card p-6 card-hover relative overflow-hidden"
            >

              {/* Glow */}
              <div className="absolute inset-0 opacity-30">

                <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-white/5 rounded-full blur-3xl" />

              </div>

              <div className="relative z-10">

                <div className="flex items-start justify-between mb-6">

                  <div>

                    <div className="text-slate-400 text-sm mb-2">
                      {card.title}
                    </div>

                    <div className="text-3xl font-black text-white tracking-tight break-words">
                      {card.value}
                    </div>

                  </div>

                  <div
                    className={`p-3 rounded-2xl border ${accentStyles[card.accent]}`}
                  >

                    <Icon className="w-5 h-5" />

                  </div>

                </div>

                <div className="text-slate-400 text-sm leading-relaxed">
                  {card.subtitle}
                </div>

              </div>

            </motion.div>
          )
        })}

      </div>

      {/* Detailed Comparison */}
      <div className="glass-card p-7">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h3 className="text-xl font-bold text-white">
              Model Benchmarking
            </h3>

            <p className="text-slate-400 mt-1">
              Performance comparison across forecasting architectures
            </p>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-white/10">

                <th className="text-left py-4 text-slate-400 font-medium">
                  Model
                </th>

                <th className="text-left py-4 text-slate-400 font-medium">
                  RMSE
                </th>

                <th className="text-left py-4 text-slate-400 font-medium">
                  MAE
                </th>

                <th className="text-left py-4 text-slate-400 font-medium">
                  MAPE
                </th>

                <th className="text-left py-4 text-slate-400 font-medium">
                  Training Time
                </th>

              </tr>

            </thead>

            <tbody>

              {Object.entries(metrics).map(([model, metric]) => {

                const isBest = model === bestModel

                return (
                  <tr
                    key={model}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >

                    <td className="py-5">

                      <div className="flex items-center gap-3">

                        {isBest && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}

                        <span className="font-semibold text-white uppercase tracking-wide">
                          {model}
                        </span>

                      </div>

                    </td>

                    <td className="py-5 text-slate-300">
                      {metric.rmse.toFixed(2)}
                    </td>

                    <td className="py-5 text-slate-300">
                      {metric.mae.toFixed(2)}
                    </td>

                    <td className="py-5 text-slate-300">
                      {metric.mape.toFixed(2)}%
                    </td>

                    <td className="py-5 text-slate-300">
                      {metric.fit_seconds?.toFixed(2) ?? '--'}s
                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}