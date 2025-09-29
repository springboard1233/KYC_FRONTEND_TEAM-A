// CHANGELOG: Reimagined as a visually engaging Radial Bar Chart with a custom legend and a consistent dark theme.
import React, { useMemo, memo } from 'react';
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { AlertTriangle } from 'lucide-react';

// --- CHART CONFIGURATION ---

const CHART_CONFIG = [
    { name: 'Low Risk', dataKey: 'low_risk_count', color: '#10b981' }, // Green
    { name: 'Medium Risk', dataKey: 'medium_risk_count', color: '#f59e0b' }, // Amber
    { name: 'High Risk', dataKey: 'high_risk_count', color: '#ef4444' }, // Red
];

// --- REUSABLE SUB-COMPONENTS ---

const CustomTooltip = memo(({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-white mb-1" style={{ color: data.color }}>{data.name}</p>
                <p className="text-gray-300">Count: <span className="font-semibold text-white">{data.count}</span></p>
            </div>
        );
    }
    return null;
});

const CustomLegend = memo(({ payload }) => (
    <div className="w-full flex flex-col space-y-3 mt-4">
        {payload.map((entry, index) => {
            const { color, value: name, payload: { count } } = entry;
            return (
                <div key={`item-${index}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }} />
                        <span className="text-gray-300">{name}</span>
                    </div>
                    <span className="font-semibold text-white">{count}</span>
                </div>
            );
        })}
    </div>
));

// --- MAIN CHART COMPONENT ---

const RiskCategoriesChart = ({ data }) => {
    const chartData = useMemo(() => {
        return CHART_CONFIG.map(item => ({
            name: item.name,
            count: data?.[item.dataKey] || 0,
            fill: item.color,
        })).reverse(); // Reverse to stack high risk on top
    }, [data]);
    
    const totalDocuments = useMemo(() => chartData.reduce((sum, item) => sum + item.count, 0), [chartData]);

    if (totalDocuments === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-600"/>
                    <p className="font-semibold">No Risk Data Available</p>
                    <p className="text-xs">Risk categories will be shown here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col justify-between">
            <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="100%"
                    barSize={15}
                    data={chartData}
                    startAngle={180}
                    endAngle={0}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, totalDocuments]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background
                        dataKey="count"
                        cornerRadius={10}
                        isAnimationActive={true}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
            </ResponsiveContainer>
            <CustomLegend payload={chartData.map(item => ({ value: item.name, color: item.fill, payload: { count: item.count }}))} />
        </div>
    );
};

export default memo(RiskCategoriesChart);


