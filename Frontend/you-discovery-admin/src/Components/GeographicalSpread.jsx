// components/GeographicalSpread.jsx
import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#f43f5e"];

const GeographicalSpread = ({ loading, setLoading }) => {
    const [data, setData] = useState({
        byCountry: {},
        nigeriaByState: {},
        nigeriaByCity: {},
    });
    // const [loading, setLoading] = useState(false);
    const [selectedView, setSelectedView] = useState('country'); // 'country' | 'state' | 'city'

    useEffect(() => {
        const fetchData = async () => {

            const token = localStorage.getItem('adminToken')
            if (!token) {
                console.warn('No token found');
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/geographical-distribution`, {
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
                console.error("Error fetching geo data:", err);
            } finally {
                // setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatMapToArray = (map) => {
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    };

    const renderPieChart = (title, dataset) => (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={dataset}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {dataset.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );

    const renderBarChart = (title, dataset) => (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dataset} layout="vertical" margin={{ top: 20, right: 0, left: -45, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );

    const views = {
        country: {
            title: "User Distribution by Country",
            data: formatMapToArray(data.byCountry),
        },
        state: {
            title: "Nigerian User Distribution by State",
            data: formatMapToArray(data.nigeriaByState),
        },
        city: {
            title: "Nigerian User Distribution by City",
            data: formatMapToArray(data.nigeriaByCity),
        },
    };

    const current = views[selectedView];

    return (
        <div className="bg-white w-full">
            <div className="flex sh:flex-row flex-col sh:items-center items-start gap-3 justify-between mb-6">
                <h2 className="sh:text-2xl text-xl font-semibold text-gray-700">📍 Geographical Spread</h2>
                <select
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                >
                    <option value="country">Country</option>
                    <option value="state">Nigerian States</option>
                    <option value="city">Nigerian Cities</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : (
                <>
                    {renderPieChart(current.title, current.data)}
                    <div className="mt-10">{renderBarChart(current.title, current.data)}</div>
                </>
            )}
        </div>
    );
};

export default GeographicalSpread;
