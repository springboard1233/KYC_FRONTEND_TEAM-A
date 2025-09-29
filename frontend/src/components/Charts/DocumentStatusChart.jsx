// CHANGELOG: Redesigned as a themed donut chart with a custom legend and a total count display in the center.
import React, { useMemo, memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

// --- CHART CONFIGURATION ---

const CHART_CONFIG = [
    { name: 'Verified', dataKey: 'verified_count', color: '#10b981' }, // Green
    { name: 'High Risk', dataKey: 'high_risk_count', color: '#ef4444' }, // Red
    { name: 'Medium Risk', dataKey: 'medium_risk_count', color: '#f59e0b' }, // Amber
    { name: 'Low Risk', dataKey: 'low_risk_count', color: '#6b7280' }, // Gray
];

// --- REUSABLE SUB-COMPONENTS ---

const CustomTooltip = memo(({ active, payload, total }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-white mb-1" style={{ color: data.color }}>{data.name}</p>
                <p className="text-gray-300">Count: <span className="font-semibold text-white">{data.value}</span></p>
                <p className="text-gray-300">Percentage: <span className="font-semibold text-white">{((data.value / total) * 100).toFixed(1)}%</span></p>
            </div>
        );
    }
    return null;
});

const CustomLegend = memo(({ payload }) => (
    <ul className="flex flex-col space-y-2 text-sm">
        {payload.map((entry, index) => (
            <li key={`item-${index}`} className="flex items-center justify-between">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-300">{entry.payload.name}</span>
                </div>
                <span className="font-semibold text-white">{entry.payload.value}</span>
            </li>
        ))}
    </ul>
));

// --- MAIN CHART COMPONENT ---

const DocumentStatusChart = ({ data }) => {
  const { chartData, total } = useMemo(() => {
    const mappedData = CHART_CONFIG
      .map(item => ({
        ...item,
        value: data?.[item.dataKey] || 0,
      }))
      .filter(item => item.value > 0);
    
    const totalValue = mappedData.reduce((sum, item) => sum + item.value, 0);

    return { chartData: mappedData, total: totalValue };
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <PieIcon className="h-12 w-12 mx-auto mb-2 text-gray-600"/>
          <p className="font-semibold">No Data Available</p>
          <p className="text-xs">The chart will populate once documents are processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-6">
        <div className="relative flex-shrink-0">
            <ResponsiveContainer width={200} height={200}>
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        isAnimationActive={true}
                    >
                        {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip total={total} />} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{total}</span>
                <span className="text-sm text-gray-400">Total</span>
            </div>
        </div>
        <div className="w-full md:w-48">
            <Legend content={<CustomLegend />} payload={chartData.map(item => ({...item, type: 'circle'}))} />
        </div>
    </div>
  );
};

export default memo(DocumentStatusChart);

