// CHANGELOG: Replaced manual div-based charts with a professional Recharts horizontal bar chart for better visualization and interactivity.
import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, AlertTriangle, Cpu } from 'lucide-react';

// --- REUSABLE SUB-COMPONENTS ---

const CustomTooltip = memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="font-semibold text-white mb-1">{label}</p>
                <p className="text-gray-300">Occurrences: <span className="font-bold text-white">{payload[0].value}</span></p>
            </div>
        );
    }
    return null;
});

const StatCard = memo(({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
        <div className="flex items-center">
            <div className={`p-2 rounded-md bg-${color}-500/20`}>
                <Icon className={`h-5 w-5 text-${color}-400`} />
            </div>
            <div className="ml-3">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-400">{title}</p>
            </div>
        </div>
    </div>
));


// --- MAIN COMPONENT ---

const FraudPatternsVisualization = ({ patterns }) => {
  const chartData = useMemo(() => {
    if (!patterns?.common_risk_factors) return [];
    
    return Object.entries(patterns.common_risk_factors)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Sort descending
      .slice(0, 7); // Take top 7
  }, [patterns]);

  if (!patterns || chartData.length === 0) {
    return (
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Brain className="h-5 w-5 text-purple-400" />Fraud Patterns Analysis</h3>
        <div className="text-center py-12 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-2 text-gray-600"/>
          <p className="font-semibold">No Pattern Data Available</p>
        </div>
      </div>
    );
  }
  
  const totalManipulationPatterns = useMemo(() => 
    Object.values(patterns.manipulation_patterns || {}).reduce((sum, count) => sum + count, 0),
  [patterns.manipulation_patterns]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-3 text-purple-400" />
            AI Fraud Patterns Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Most Common Risk Factors</h4>
                <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="name"
                                width={150}
                                tick={{ fill: '#a0aec0', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                            <Bar dataKey="count" barSize={20} radius={[0, 4, 4, 0]}>
                                <Cell fill="url(#colorGradient)" />
                            </Bar>
                             <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#f59e0b" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-4">
                 <h4 className="text-sm font-medium text-gray-300">Summary</h4>
                 <StatCard title="Total Unique Patterns" value={patterns.total_patterns || 0} icon={Brain} color="purple" />
                 <StatCard title="Manipulation Patterns" value={totalManipulationPatterns} icon={Cpu} color="yellow" />
                 <StatCard title="Top Risk Indicators" value={chartData.length} icon={AlertTriangle} color="red" />
            </div>
        </div>
    </motion.div>
  );
};

export default memo(FraudPatternsVisualization);

