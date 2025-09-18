// Charts/DocumentTypesChart.jsx - Document Types Distribution Chart

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DocumentTypesChart = ({ data }) => {
  // Prepare chart data
  const chartData = [
    {
      name: 'Aadhaar',
      count: data?.aadhaar_count || 0,
      color: '#3b82f6'
    },
    {
      name: 'PAN',
      count: data?.pan_count || 0,
      color: '#8b5cf6'
    }
  ]

  if (!chartData.some(item => item.count > 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📄</div>
          <p>No documents processed yet</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label} Documents</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <div className="flex items-center mt-1">
            <div 
              className="w-3 h-3 rounded mr-2" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="text-xs text-gray-500">Document Type</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
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
            fill="#3b82f6"
          >
            {chartData.map((entry, index) => (
              <Bar key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DocumentTypesChart
