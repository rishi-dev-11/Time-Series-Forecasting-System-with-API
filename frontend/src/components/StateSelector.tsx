// import React from 'react'

// interface StateSelectorProps {
//   states: string[]
//   selectedState: string
//   onSelect: (state: string) => void
//   loading: boolean
// }

// export const StateSelector: React.FC<StateSelectorProps> = ({
//   states,
//   selectedState,
//   onSelect,
//   loading
// }) => {
//   return (
//     <div className="flex flex-col gap-2">
//       <label className="text-sm font-semibold text-gray-700">Select State</label>
//       <select
//         value={selectedState}
//         onChange={(e) => onSelect(e.target.value)}
//         disabled={loading || states.length === 0}
//         className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         <option value="">-- Choose a state --</option>
//         {states.map((state) => (
//           <option key={state} value={state}>
//             {state}
//           </option>
//         ))}
//       </select>
//     </div>
//   )
// }




import React from 'react'
import { motion } from 'framer-motion'
import {
  MapPinned,
  ChevronDown,
  Loader2
} from 'lucide-react'

interface StateSelectorProps {
  states: string[]
  selectedState: string
  onSelect: (state: string) => void
  loading: boolean
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  states,
  selectedState,
  onSelect,
  loading
}) => {
  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="flex items-center gap-3 mb-3">

            <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/20">

              <MapPinned className="w-5 h-5 text-blue-400" />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-white">
                Regional Forecasting
              </h2>

              <p className="text-slate-400 mt-1">
                Analyze predictive sales trends across geographic regions
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Selector */}
      <div className="relative">

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative"
        >

          <select
            value={selectedState}
            onChange={(e) => onSelect(e.target.value)}
            disabled={loading || states.length === 0}
            className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-5 pr-16 text-lg font-medium text-white outline-none transition-all duration-300 focus:border-blue-400/40 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <option value="" className="bg-slate-900">
              Select Region
            </option>

            {states.map((state) => (
              <option
                key={state}
                value={state}
                className="bg-slate-900"
              >
                {state}
              </option>
            ))}

          </select>

          {/* Right Icon */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">

            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}

          </div>

        </motion.div>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="glass-card p-5 card-hover">

          <div className="text-slate-400 text-sm mb-2">
            Forecast Regions
          </div>

          <div className="text-3xl font-black text-white">
            {states.length}
          </div>

        </div>

        <div className="glass-card p-5 card-hover">

          <div className="text-slate-400 text-sm mb-2">
            Forecast Window
          </div>

          <div className="text-3xl font-black text-white">
            8W
          </div>

        </div>

        <div className="glass-card p-5 card-hover">

          <div className="text-slate-400 text-sm mb-2">
            AI Models
          </div>

          <div className="text-3xl font-black text-white">
            4
          </div>

        </div>

      </div>

    </div>
  )
}