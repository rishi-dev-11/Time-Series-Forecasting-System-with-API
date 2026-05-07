import React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Sparkles,
  Activity
} from 'lucide-react'

export const Header: React.FC = () => {
  return (
    <header className="relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0">

        <div className="absolute top-[-120px] left-[-80px] w-[320px] h-[320px] bg-blue-500/20 blur-3xl rounded-full" />

        <div className="absolute top-[40px] right-[-120px] w-[320px] h-[320px] bg-violet-500/20 blur-3xl rounded-full" />

      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-8">

        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8"
        >

          {/* Left Content */}
          <div className="max-w-3xl">

            <div className="flex items-center gap-3 mb-5">

              <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/20">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>

              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-slate-400 font-semibold">

                <Sparkles className="w-4 h-4 text-violet-400" />

                Predictive Intelligence Platform

              </div>

            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-[-0.04em]">

              <span className="gradient-text">
                Sales Forecast
              </span>

              <br />

              <span className="text-white">
                Analytics Dashboard
              </span>

            </h1>

            <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl">

              Advanced forecasting powered by statistical,
              machine learning, and deep learning models
              for intelligent regional sales projections.

            </p>

          </div>

          {/* Right Stats Card */}
          <motion.div
            animate={{
              y: [0, -8, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="glass-card p-6 min-w-[280px] card-hover"
          >

            <div className="flex items-center justify-between mb-6">

              <div>

                <div className="text-slate-400 text-sm mb-2">
                  Forecast Horizon
                </div>

                <div className="text-5xl font-black text-white">
                  8
                </div>

              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/20">

                <Activity className="w-8 h-8 text-emerald-400" />

              </div>

            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Forecast Window
                </span>

                <span className="font-semibold text-white">
                  Weekly
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Model Strategy
                </span>

                <span className="font-semibold text-white">
                  Multi-Model
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Forecast Engine
                </span>

                <span className="font-semibold text-emerald-400">
                  Active
                </span>
              </div>

            </div>

          </motion.div>

        </motion.div>

      </div>

    </header>
  )
}