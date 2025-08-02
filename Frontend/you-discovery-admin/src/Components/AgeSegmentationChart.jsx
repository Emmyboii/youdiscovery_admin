import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
  High: '#4ade80',     // green
  Moderate: '#60a5fa', // blue
  Low: '#facc15',      // yellow
  Inactive: '#f87171'  // red
};

const AgeSegmentationChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {

    const token = localStorage.getItem('adminToken')
    if (!token) {
      console.warn('No token found');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/age-segmentation`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      })
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching age segmentation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white w-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Age Segmentation</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Table View */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm text-left border border-gray-300">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="p-3">Age Range</th>
                  <th className="p-3">Count</th>
                  <th className="p-3">%</th>
                  <th className="p-3">Avg Completion (%)</th>
                  <th className="p-3">High</th>
                  <th className="p-3">Moderate</th>
                  <th className="p-3">Low</th>
                  <th className="p-3">Inactive</th>
                </tr>
              </thead>
              <tbody>
                {data.map((group, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="p-3">{group.range}</td>
                    <td className="p-3">{group.count}</td>
                    <td className="p-3">{group.percent}%</td>
                    <td className="p-3">{group.avgCompletion}%</td>
                    <td className="p-3">{group.activityBreakdown.High}</td>
                    <td className="p-3">{group.activityBreakdown.Moderate}</td>
                    <td className="p-3">{group.activityBreakdown.Low}</td>
                    <td className="p-3">{group.activityBreakdown.Inactive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar Chart View */}
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 20, right: 0, left: -30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="activityBreakdown.High" stackId="a" fill={COLORS.High} name="High" />
                <Bar dataKey="activityBreakdown.Moderate" stackId="a" fill={COLORS.Moderate} name="Moderate" />
                <Bar dataKey="activityBreakdown.Low" stackId="a" fill={COLORS.Low} name="Low" />
                <Bar dataKey="activityBreakdown.Inactive" stackId="a" fill={COLORS.Inactive} name="Inactive" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default AgeSegmentationChart;
