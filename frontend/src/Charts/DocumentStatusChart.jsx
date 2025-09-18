// Charts/DocumentStatusChart.jsx - Document Status Distribution Chart

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const DocumentStatusChart = ({ data }) => {
  // Prepare chart data
  const chartData = [
    {
      name: 'Verified',
      value: data?.verified_count || 0,
      color: '#10b981'
    },
    {
      name: 'High Risk',
      value: data?.high_risk_count || 0,
      color: '#ef4444'
    },
    {
      name: 'Medium Risk',
      value: data?.medium_risk_count || 0,
      color: '#f59e0b'
    },
    {
      name: 'Low Risk',
      value: data?.low_risk_count || 0,
      color: '#6b7280'
    }
  ]

  // Filter out zero values
  const filteredData = chartData.filter(item => item.value > 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-semibold">
              {((data.value / (data?.total || 1)) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DocumentStatusChart
