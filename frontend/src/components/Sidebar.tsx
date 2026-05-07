import React from 'react'

import { motion } from 'framer-motion'

import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  BrainCircuit,
  Sparkles,
} from 'lucide-react'

const navItems = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: 'Forecasting',
    icon: TrendingUp,
  },
  {
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    label: 'AI Models',
    icon: BrainCircuit,
  },
]

export const Sidebar: React.FC = () => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}

      className="hidden xl:flex flex-col fixed left-0 top-0 h-screen w-[290px] border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl z-50"
    >

      {/* Logo */}
      <div className="px-8 py-8 border-b border-white/10">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-2xl shadow-blue-500/20">

            <Sparkles className="w-7 h-7 text-white" />

          </div>

          <div>

            <div className="text-xl font-black text-white tracking-tight">
              ForecastIQ
            </div>

            <div className="text-sm text-slate-400 mt-1">
              Predictive Intelligence
            </div>

          </div>

        </div>

      </div>

      {/* Navigation */}
      <div className="flex-1 px-5 py-8">

        <div className="space-y-3">

          {navItems.map((item) => {

            const Icon = item.icon

            return (
              <motion.button
                key={item.label}

                whileHover={{
                  scale: 1.02
                }}

                whileTap={{
                  scale: 0.98
                }}

                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300
                  ${
                    item.active
                      ? 'bg-blue-500/15 border border-blue-400/20 text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                  }
                `}
              >

                <div
                  className={`
                    p-2 rounded-xl
                    ${
                      item.active
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-white/[0.04]'
                    }
                  `}
                >

                  <Icon className="w-5 h-5" />

                </div>

                <span className="font-medium">
                  {item.label}
                </span>

              </motion.button>
            )
          })}

        </div>

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/10">

        <div className="glass-card p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-emerald-300 font-semibold text-sm">
              Forecast Engine Active
            </span>

          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Multi-model predictive forecasting system powered by advanced analytics.
          </p>

        </div>

      </div>

    </motion.aside>
  )
}