// import React from 'react'
// import type { ForecastPoint } from '../types/api'

// interface ForecastTableProps {
//   data: ForecastPoint[]
//   state: string
// }

// export const ForecastTable: React.FC<ForecastTableProps> = ({ data, state }) => {
//   if (!data || data.length === 0) {
//     return (
//       <div className="text-gray-500 text-center py-8">No forecast data available</div>
//     )
//   }

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b border-gray-200">
//             <tr>
//               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
//                 Week Ending
//               </th>
//               <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
//                 Predicted Sales ($)
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {data.map((point, index) => (
//               <tr key={index} className="hover:bg-blue-50 transition-colors">
//                 <td className="px-6 py-4 text-sm text-gray-800 font-medium">
//                   {new Date(point.date).toLocaleDateString('en-US', {
//                     month: 'short',
//                     day: 'numeric',
//                     year: 'numeric'
//                   })}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
//                   ${point.prediction.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }




import React from 'react'
import { motion } from 'framer-motion'

import {
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'

interface ForecastPoint {
  date: string
  prediction: number
  lower_bound?: number
  upper_bound?: number
}

interface ForecastTableProps {
  forecast: ForecastPoint[]
}

export const ForecastTable: React.FC<ForecastTableProps> = ({
  forecast = [],
}) => {

    if (!forecast.length) {
    return null
    }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card overflow-hidden"
    >

      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/10">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>

            <div className="flex items-center gap-3 mb-3">

              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/20">

                <TrendingUp className="w-5 h-5 text-cyan-400" />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Forecast Breakdown
                </h2>

                <p className="text-slate-400 mt-1">
                  Weekly predictive sales intelligence and projection ranges
                </p>

              </div>

            </div>

          </div>

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10">

            <CalendarDays className="w-5 h-5 text-slate-300" />

            <span className="text-slate-300 font-medium">
              {forecast.length} Forecast Periods
            </span>

          </div>

        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[760px]">

          <thead>

            <tr className="border-b border-white/10 bg-white/[0.02]">

              <th className="text-left px-8 py-5 text-slate-400 font-semibold uppercase tracking-wide text-sm">
                Week
              </th>

              <th className="text-left px-8 py-5 text-slate-400 font-semibold uppercase tracking-wide text-sm">
                Forecast
              </th>

              <th className="text-left px-8 py-5 text-slate-400 font-semibold uppercase tracking-wide text-sm">
                Lower Range
              </th>

              <th className="text-left px-8 py-5 text-slate-400 font-semibold uppercase tracking-wide text-sm">
                Upper Range
              </th>

              <th className="text-left px-8 py-5 text-slate-400 font-semibold uppercase tracking-wide text-sm">
                Trend
              </th>

            </tr>

          </thead>

          <tbody>

            {forecast.map((point, index) => {

              const lower =
                point.lower_bound ??
                point.prediction * 0.9

              const upper =
                point.upper_bound ??
                point.prediction * 1.1

              return (
                <motion.tr
                  key={point.date}

                  initial={{
                    opacity: 0,
                    y: 12
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  transition={{
                    delay: index * 0.04
                  }}

                  className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300"
                >

                  {/* Date */}
                  <td className="px-8 py-6">

                    <div>

                      <div className="font-semibold text-white">
                        {formatDate(point.date)}
                      </div>

                      <div className="text-sm text-slate-400 mt-1">
                        Forecast Week {index + 1}
                      </div>

                    </div>

                  </td>

                  {/* Prediction */}
                  <td className="px-8 py-6">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">

                        <TrendingUp className="w-5 h-5 text-blue-400" />

                      </div>

                      <div>

                        <div className="text-xl font-bold text-white">
                          {formatNumber(point.prediction)}
                        </div>

                        <div className="text-sm text-slate-400">
                          Predicted Sales
                        </div>

                      </div>

                    </div>

                  </td>

                  {/* Lower */}
                  <td className="px-8 py-6">

                    <div className="text-lg font-semibold text-slate-300">
                      {formatNumber(lower)}
                    </div>

                  </td>

                  {/* Upper */}
                  <td className="px-8 py-6">

                    <div className="text-lg font-semibold text-slate-300">
                      {formatNumber(upper)}
                    </div>

                  </td>

                  {/* Trend */}
                  <td className="px-8 py-6">

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20">

                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />

                      <span className="text-emerald-300 font-medium text-sm">
                        Positive Outlook
                      </span>

                    </div>

                  </td>

                </motion.tr>
              )
            })}

          </tbody>

        </table>

      </div>

    </motion.div>
  )
}