// components/EngagementAnalysis.jsx
import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
    BarChart, Bar
} from 'recharts';

const EngagementAnalysis = () => {
    const [data, setData] = useState({
        registrations: [],
        completions: [],
        logins: [],
        activeUsers: [],
        peakPeriod: null
    });
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState('monthly'); // 'monthly' | 'weekly' | 'daily'

    useEffect(() => {
        const fetchData = async () => {

            const token = localStorage.getItem('adminToken')
            if (!token) {
                console.warn('No token found');
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/engagement-analysis?range=${range}`, {
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
                console.error("Error fetching engagement data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [range]);

    return (
        <div className="bg-white w-full">
            <div className="flex sh:items-center items-start sh:flex-row flex-col gap-3 justify-between mb-6">
                <h2 className="sh:text-2xl text-lg font-semibold text-gray-700">📊 Engagement & Activity Analysis</h2>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : (
                <>
                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">📈 New Registrations</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.registrations} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">✅ Task/Quiz Completions</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.completions} margin={{ top: 20, right: 0, left: -30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="quizzes" stroke="#10b981" name="Quizzes" />
                                <Line type="monotone" dataKey="tasks" stroke="#f59e0b" name="Tasks" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">🔐 Login Activity</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.logins} margin={{ top: 20, right: 0, left: -30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="logins" stroke="#3b82f6" name="Logins" />
                            </LineChart>
                        </ResponsiveContainer>
                        <p className="mt-2 text-sm text-gray-600">🕓 Peak login period: <span className="font-medium">{data.peakPeriod || 'Unknown'}</span></p>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">📌 Active Users Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.activeUsers} margin={{ top: 20, right: 0, left: -30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Active Users" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default EngagementAnalysis;
