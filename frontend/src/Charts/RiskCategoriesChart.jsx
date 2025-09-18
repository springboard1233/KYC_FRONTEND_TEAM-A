// Charts/RiskCategoriesChart.jsx - Risk Categories Distribution Chart

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const RiskCategoriesChart = ({ data }) => {
  // Prepare risk categories data
  const chartData = [
    {
      category: 'Low Risk',
      count: data?.low_risk_count || 0,
      color: '#10b981',
      description: 'Safe documents'
    },
    {
      category: 'Medium Risk',
      count: data?.medium_risk_count || 0,
      color: '#f59e0b',
      description: 'Requires attention'
    },
    {
      category: 'High Risk',
      count: data?.high_risk_count || 0,
      color: '#ef4444',
      description: 'Potential fraud'
    }
  ]

  const totalDocuments = chartData.reduce((sum, item) => sum + item.count, 0)

  if (totalDocuments === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p>No risk data available</p>
          <p className="text-sm">Upload documents to see risk analysis</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = totalDocuments > 0 ? ((data.value / totalDocuments) * 100).toFixed(1) : 0
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600 mb-1">{data.payload.description}</p>
          <p className="text-sm">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-semibold">{percentage}%</span>
          </p>
          <div className="flex items-center mt-2">
            <div 
              className="w-3 h-3 rounded mr-2" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="text-xs text-gray-500">Risk Level</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            radius={[4, 4, 0, 0]}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Risk Level Legend */}
      <div className="mt-4 flex justify-center space-x-6">
        {chartData.filter(item => item.count > 0).map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded mr-2" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">
              {item.category}: {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RiskCategoriesChart
