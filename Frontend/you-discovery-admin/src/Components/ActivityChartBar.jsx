// components/UserConsistencyChart.jsx
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ActivityBarChart = ({ stats }) => {
  const [range, setRange] = useState(7);

  // Filter chart data by selected day range
  const filteredData = useMemo(() => {
    const raw = stats?.activityChartData || [];
    return raw.slice(-range);
  }, [stats, range]);

  const consistency = stats?.consistency || {};
  const badge = consistency.badge || '';
  const consistencyPercentage = {
    7: consistency.last7Days,
    30: consistency.last30Days,
    90: consistency.last90Days
  }[range] || 0;

  return (
    <div className="p-4 bg-white rounded-xl shadow-md w-full max-w-4xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Learning Consistency</h2>
        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium text-lg">Consistency:</span> {consistencyPercentage}% | 
        <span className="ml-2 font-medium text-lg">Badge:</span> <span className="text-lg">{badge}</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} domain={[0, 1]} />
          <Tooltip
            formatter={(value) => value === 1 ? 'Completed' : 'Not completed'}
          />
          <Bar dataKey="completed" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityBarChart;
