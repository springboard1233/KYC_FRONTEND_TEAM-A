// CHANGELOG: Converted to a themed AreaChart with gradients, a legend, and improved data simulation logic for a polished look.
import React, { useMemo, memo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

// --- CHART CONFIGURATION & DATA SIMULATION ---

const useTrendData = (baseStats) => {
    return useMemo(() => {
        // NOTE: This is for demonstration purposes.
        // In a real application, you would fetch actual time-series data from an API.
        if (!baseStats || baseStats.total_records === 0) {
            return [];
        }

        const labels = ['-2 Months', '-1 Month', 'Current'];
        return labels.map((period, i) => {
            const variation = (Math.random() - 0.5) * (15 - i * 4); // Less variation for 'Current'
            return {
                period,
                'Fraud Score': Math.max(0, Math.min(100, (baseStats.avg_fraud_score || 25) + variation)),
                'Confidence': Math.max(0, Math.min(100, (baseStats.avg_confidence || 90) - variation * 0.5)),
            };
        });
    }, [baseStats]);
};

// --- REUSABLE SUB-COMPONENTS ---

const CustomTooltip = memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-lg shadow-lg text-sm space-y-1">
                <p className="font-bold text-white mb-1">{label}</p>
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
                        <p className="text-gray-300">{entry.name}: <span className="font-semibold text-white">{entry.value.toFixed(1)}%</span></p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
});

// --- MAIN CHART COMPONENT ---

const FraudTrendsChart = ({ data }) => {
  const chartData = useTrendData(data);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-600"/>
          <p className="font-semibold">Not Enough Data for Trends</p>
          <p className="text-xs">Trends will appear after more documents are processed.</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis dataKey="period" tick={{ fill: '#a0aec0', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#a0aec0', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
        <Area type="monotone" dataKey="Fraud Score" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" />
        <Area type="monotone" dataKey="Confidence" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorConfidence)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default memo(FraudTrendsChart);

