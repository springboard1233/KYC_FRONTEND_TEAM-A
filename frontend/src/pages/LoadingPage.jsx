import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import { Shield, Zap, CheckCircle, Lock, Sparkles } from "lucide-react";

export default function LoadingPage() {
  const processingSteps = [
    { icon: Shield, text: "Securing document with encryption", delay: 0 },
    { icon: Zap, text: "AI analyzing document structure", delay: 0.5 },
    { icon: CheckCircle, text: "Extracting information with OCR", delay: 1 },
    { icon: Lock, text: "Validating authenticity", delay: 1.5 },
    { icon: Sparkles, text: "Finalizing secure verification", delay: 2 },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-12 max-w-md w-full text-center"
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-amber-400/20 rounded-3xl blur-xl" />

        {/* Header */}
        <div className="relative z-10 mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-3xl mb-6 shadow-2xl shadow-yellow-500/25"
            animate={{
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.3)",
                "0 0 40px rgba(245, 158, 11, 0.5)",
                "0 0 20px rgba(251, 191, 36, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-black" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            AI Processing Document
          </h2>
          <p className="text-slate-400">
            Advanced neural networks analyzing your document
          </p>
        </div>

        {/* Processing Animation */}
        <div className="relative z-10 mb-8">
          <div className="relative w-28 h-28 mx-auto mb-6">
            {/* Outer ring with gradient */}
            <motion.div
              className="absolute inset-0 border-4 border-transparent rounded-full"
              style={{
                background:
                  "linear-gradient(45deg, #F59E0B, #F97316, #EAB308, #F59E0B)",
                backgroundClip: "padding-box",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle ring */}
            <motion.div
              className="absolute inset-2 border-4 border-transparent rounded-full"
              style={{
                background:
                  "linear-gradient(225deg, #EAB308, #F59E0B, #EAB308)",
                backgroundClip: "padding-box",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner ring */}
            <motion.div
              className="absolute inset-4 border-3 border-yellow-400/50 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />

            {/* Center core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.3, 1],
                  boxShadow: [
                    "0 0 10px rgba(245, 158, 11, 0.5)",
                    "0 0 25px rgba(251, 191, 36, 0.8)",
                    "0 0 10px rgba(245, 158, 11, 0.5)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  className="w-full h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="h-3 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500 rounded-full shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="relative z-10 space-y-4">
          {processingSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: step.delay }}
              className="flex items-center justify-start text-sm text-slate-300"
            >
              <motion.div
                className="w-8 h-8 bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-slate-700"
                animate={{
                  backgroundColor: [
                    "rgba(30, 41, 59, 0.5)",
                    "rgba(251, 191, 36, 0.3)",
                    "rgba(30, 41, 59, 0.5)",
                  ],
                  borderColor: [
                    "rgb(51, 65, 85)",
                    "rgb(251, 191, 36)",
                    "rgb(51, 65, 85)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: step.delay,
                }}
              >
                <step.icon className="w-4 h-4 text-yellow-400" />
              </motion.div>
              <span className="flex-1 text-left">{step.text}</span>
              <motion.div
                className="ml-3 flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: step.delay + 0.2 }}
              >
                {[0, 0.15, 0.3].map((dotDelay, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: dotDelay,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          className="relative z-10 mt-8 p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50"
        >
          <div className="flex items-center justify-center text-sm text-yellow-300">
            <Lock className="w-4 h-4 mr-2" />
            <span>Your data is encrypted and secure</span>
          </div>
        </motion.div>

        {/* Estimated time */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 3 }}
          className="relative z-10 mt-4 text-xs text-slate-500"
        >
          Estimated time: 2-4 seconds
        </motion.p>
      </motion.div>
    </div>
  );
}
