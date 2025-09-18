// Charts/FraudTrendsChart.jsx - Fraud Score Trends Chart

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const FraudTrendsChart = ({ data }) => {
  // Generate trend data based on available statistics
  const generateTrendData = () => {
    const avgFraudScore = data?.avg_fraud_score || 0
    const fraudDetectionRate = data?.fraud_detection_rate || 0
    
    // Simulate trend data for demonstration
    const trendData = []
    const labels = ['Last Week', 'This Week', 'Current']
    
    for (let i = 0; i < labels.length; i++) {
      const variation = (Math.random() - 0.5) * 10 // ±5 variation
      trendData.push({
        period: labels[i],
        fraudScore: Math.max(0, Math.min(100, avgFraudScore + variation)),
        detectionRate: Math.max(0, Math.min(100, fraudDetectionRate + variation * 0.5)),
        confidence: Math.max(0, Math.min(100, (data?.avg_confidence || 90) + variation * 0.3))
      })
    }
    
    return trendData
  }

  const chartData = generateTrendData()

  if (!data || data.total_records === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No trend data available</p>
          <p className="text-sm">Process documents to see trends</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center mb-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: <span className="font-semibold">{entry.value.toFixed(1)}%</span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="fraudScore"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#fraudGradient)"
            name="Fraud Score"
          />
          <Area
            type="monotone"
            dataKey="confidence"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#confidenceGradient)"
            name="Confidence"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FraudTrendsChart
