import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
    BarChart, Bar, Cell
} from 'recharts';

const formatDateLabel = (d) => {
    // from 'YYYY-MM-DD' to nicer label
    try {
        const dt = new Date(d);
        if (!isNaN(dt)) {
            return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        return d;
    } catch {
        return d;
    }
};

const EngagementAnalysis = ({ loading, data, data2 }) => {
    const [range, setRange] = useState('monthly');
    const [view, setView] = useState('daily')

    const dailySeries = (data2.daily || []).map(d => ({ date: d.date, count: d.count }));
    const weeklySeries = (data2.weekly || []).map(d => ({ label: d.week, count: d.count }));
    const monthlySeries = (data2.monthly || []).map(d => ({ label: d.month, count: d.count }));

    // Hourly chart data
    const hourly = data2.hourlyCounts || []; // [{hour, count},...]

    // Format for charts:
    const chartSeries = view === 'daily' ? dailySeries
        : view === 'weekly' ? weeklySeries
            : monthlySeries;


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

                    {/* Class Activities */}
                    <div className="space-y-6 mb-6">
                        {/* header + stats */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h2 className="text-lg font-medium">📈 Class Activity</h2>
                                <p className="text-sm text-gray-600 mt-1">Recent completions & peak times (day vs night)</p>
                            </div>

                            <div className="flex gap-3 items-center">
                                <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
                                    <div className="text-xs text-gray-500">Daytime Completions</div>
                                    <div className="text-xl font-semibold">{data2.dayCount ?? data2.daytimeCount ?? 0}</div>
                                </div>

                                <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
                                    <div className="text-xs text-gray-500">Nighttime Completions</div>
                                    <div className="text-xl font-semibold">{data2.nightCount ?? data2.nighttimeCount ?? 0}</div>
                                </div>

                                <div className="bg-white border rounded-lg p-3 text-center shadow-sm">
                                    <div className="text-xs text-gray-500">Peak Time</div>
                                    <div className="text-xl font-semibold">{data2.peakTime ?? (data2.daytimeCount >= data2.nighttimeCount ? 'day' : 'night')}</div>
                                </div>
                            </div>
                        </div>

                        {/* controls */}
                        <div className="flex gap-2 items-center">
                            <div className="text-sm text-gray-600">View:</div>
                            <button
                                onClick={() => setView('daily')}
                                className={`px-3 py-1 rounded ${view === 'daily' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setView('weekly')}
                                className={`px-3 py-1 rounded ${view === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setView('monthly')}
                                className={`px-3 py-1 rounded ${view === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                            >
                                Monthly
                            </button>
                        </div>

                        {/* main charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Line chart (daily/weekly/monthly) */}
                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                                <h3 className="mb-2 font-medium">{view === 'daily' ? 'Daily completions' : view === 'weekly' ? 'Weekly completions' : 'Monthly completions'}</h3>
                                {chartSeries.length === 0 ? (
                                    <p className="text-gray-500">No data for the selected view.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartSeries}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey={view === 'daily' ? 'date' : 'label'} tickFormatter={(v) => view === 'daily' ? formatDateLabel(v) : v} />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip labelFormatter={(v) => (view === 'daily' ? formatDateLabel(v) : v)} />
                                            <Line type="monotone" dataKey="count" stroke="#1f6feb" strokeWidth={2} dot={{ r: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Right: Hourly bar chart */}
                            <div className="bg-white border rounded-lg p-4 shadow-sm">
                                <h3 className="mb-2 font-medium">Hourly completions (0–23)</h3>
                                {hourly.length === 0 ? (
                                    <p className="text-gray-500">No hourly data available.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={hourly}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="hour" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" name="Completions">
                                                {hourly.map((entry, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={entry.hour >= 6 && entry.hour < 18 ? '#60a5fa' : '#6366f1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* raw JSON preview (optional, helpful for debugging) */}
                        {/* <details className="bg-white border rounded-lg p-4 text-sm text-gray-700">
                            <summary className="cursor-pointer font-medium">Raw API response (expand)</summary>
                            <pre className="mt-2 max-h-72 overflow-auto text-xs">
                                {JSON.stringify(data2, null, 2)}
                            </pre>
                        </details> */}
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
