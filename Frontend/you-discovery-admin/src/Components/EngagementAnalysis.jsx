import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
    BarChart, Bar
} from 'recharts';

const EngagementAnalysis = ({ loading, data }) => {
    // const [data, setData] = useState({
    //     registrations: [],
    //     completions: [],
    //     logins: [],
    //     activeUsersTrend: [],
    //     activeUsersTotal: null,
    //     peakPeriod: null
    // });
    // const [loading, setLoading] = useState(false);
    const [range, setRange] = useState('monthly'); // monthly | weekly | daily

    // useEffect(() => {
    //     const fetchData = async () => {
    //         const token = localStorage.getItem('adminToken');
    //         if (!token) return;

    //         setLoading(true);
    //         try {
    //             const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/engagement-analysis?range=${range}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             });
    //             const result = await res.json();
    //             setData(result);
    //         } catch (err) {
    //             console.error("Error fetching engagement data:", err);
    //         } finally {
    //             // setLoading(false);
    //         }
    //     };
    //     fetchData();
    // }, [range]);

    return (
        <div className="bg-white w-full">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-700">📊 Engagement & Activity Analysis</h2>
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
                    {/* Registrations */}
                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">📈 New Registrations</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.registrations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Quiz Completions */}
                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">✅ Quiz Attempts & Passed</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.completions}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="attempted" stroke="#f59e0b" name="Attempted" />
                                <Line type="monotone" dataKey="passed" stroke="#10b981" name="Passed" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Logins */}
                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">🔐 Login Activity</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.logins}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="logins" stroke="#3b82f6" name="Logins" />
                            </LineChart>
                        </ResponsiveContainer>
                        {/* <p className="mt-2 text-sm text-gray-600">
                            🕓 Peak login period: <span className="font-medium">{data.peakPeriod || 'Unknown'}</span>
                        </p> */}
                    </div>

                    {/* Active Users Card */}
                    <div className="mb-6">
                        <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 w-full sm:w-[300px]">
                            <p className="text-gray-600 text-sm">🙋 Total Active Users</p>
                            <h3 className="text-3xl font-bold text-indigo-700">
                                {data.activeUsersTotal ?? '—'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Real-time active users</p>
                        </div>
                    </div>

                    {/* Active Users Trend */}
                    <div className="mb-10">
                        <h3 className="text-lg font-medium mb-3">📌 Active Users Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.activeUsersTrend}>
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
