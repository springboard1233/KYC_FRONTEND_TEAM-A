// CHANGELOG: Fixed Recharts rendering bug, restyled for dark theme, and added data labels for improved readability.
import React, { useMemo, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

// --- CHART CONFIGURATION ---

const CHART_CONFIG = [
    { name: 'Aadhaar', dataKey: 'aadhaar_count', color: '#3b82f6' }, // Blue
    { name: 'PAN', dataKey: 'pan_count', color: '#8b5cf6' },     // Purple
];

// --- REUSABLE SUB-COMPONENTS ---

const CustomTooltip = memo(({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-white mb-1">{label} Cards</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: data.payload.color }} />
                    <p className="text-gray-300">Count: <span className="font-semibold text-white">{data.value}</span></p>
                </div>
            </div>
        );
    }
    return null;
});

const CustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    return (
        <text x={x + width / 2} y={y} dy={-8} fill="#a0aec0" fontSize="14" textAnchor="middle">
            {value}
        </text>
    );
};

// --- MAIN CHART COMPONENT ---

const DocumentTypesChart = ({ data }) => {
    const chartData = useMemo(() => 
        CHART_CONFIG.map(item => ({
            name: item.name,
            count: data?.[item.dataKey] || 0,
            color: item.color,
        })),
    [data]);

    const hasData = useMemo(() => chartData.some(item => item.count > 0), [chartData]);

    if (!hasData) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <BarChart2 className="h-12 w-12 mx-auto mb-2 text-gray-600"/>
                    <p className="font-semibold">No Documents Processed</p>
                    <p className="text-xs">This chart will show the breakdown by type.</p>
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#a0aec0', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                />
                <YAxis 
                    allowDecimals={false} 
                    tick={{ fill: '#a0aec0', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                    {/* CORRECTED: Use Cell for individual bar colors */}
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="count" content={<CustomizedLabel />} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default memo(DocumentTypesChart);

