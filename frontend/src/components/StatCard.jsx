import React from "react";
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
}) {
  const colorConfig = {
    blue: {
      bg: "from-blue-600/20 to-cyan-600/20",
      border: "border-blue-500/30",
      text: "text-blue-400",
      glow: "shadow-blue-500/20",
    },
    green: {
      bg: "from-emerald-600/20 to-green-600/20",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "shadow-emerald-500/20",
    },
    yellow: {
      bg: "from-amber-600/20 to-yellow-600/20",
      border: "border-amber-500/30",
      text: "text-amber-400",
      glow: "shadow-amber-500/20",
    },
    red: {
      bg: "from-red-600/20 to-rose-600/20",
      border: "border-red-500/30",
      text: "text-red-400",
      glow: "shadow-red-500/20",
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 17 },
      }}
      className="group relative"
    >
      {/* Enhanced glow effect */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${config.bg} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500`}
      ></div>

      <div
        className={`relative bg-slate-800/40 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-500 group-hover:bg-slate-800/60 group-hover:shadow-xl ${config.border} ${config.glow}`}
      >
        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent rounded-2xl pointer-events-none"></div>

        <div className="relative z-10">
          {/* Enhanced Icon */}
          <motion.div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center mb-6 border ${config.border} relative overflow-hidden`}
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon className={`w-7 h-7 ${config.text} relative z-10`} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          </motion.div>

          {/* Enhanced Value */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
            className="text-4xl font-bold text-white mb-3 tracking-tight"
          >
            {value}
          </motion.div>

          {/* Enhanced Title */}
          <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">
            {title}
          </p>

          {/* Enhanced animated background particles */}
          <div
            className="absolute top-6 right-6 w-2 h-2 bg-current rounded-full opacity-20 animate-ping"
            style={{ animationDelay: `${delay}s` }}
          ></div>
          <div
            className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-current rounded-full opacity-30 animate-pulse"
            style={{ animationDelay: `${delay + 0.7}s` }}
          ></div>
          <div
            className="absolute top-12 right-12 w-1 h-1 bg-current rounded-full opacity-40 animate-pulse"
            style={{ animationDelay: `${delay + 1.2}s` }}
          ></div>
        </div>

        {/* Enhanced border animation */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${config.bg} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}
