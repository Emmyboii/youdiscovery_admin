import React, { useEffect, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#f59e0b"]; // Blue & Yellow

const GenderDistributionChart = ({ loading, data }) => {
    const [cohort, setCohort] = useState('');
    const [dateJoined, setDateJoined] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('adminToken');
            const params = new URLSearchParams();
            if (cohort) params.append("cohort", cohort);
            if (dateJoined) params.append("dateJoined", dateJoined);

            const res = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/gender-distribution?${params.toString()}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const result = await res.json();
            console.log(result); // 👈 here you’d set state instead of just logging
        };

        fetchData();
    }, [cohort, dateJoined]);

    return (
        <div className="bg-white w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl w-full font-bold text-gray-700">👥 Gender Distribution</h2>

                <div className="flex sp:flex-row flex-col gap-3 w-full sm:w-auto">
                    {/* Cohort filter */}
                    <input
                        type="text"
                        value={cohort}
                        onChange={(e) => setCohort(e.target.value)}
                        placeholder="Enter cohort number"
                        className="border rounded px-3 py-2 text-sm w-[150px]"
                    />

                    {/* Date joined filter */}
                    <input
                        type="date"
                        value={dateJoined}
                        onChange={(e) => setDateJoined(e.target.value)}
                        className="border rounded px-3 py-2 text-sm w-[180px]"
                    />
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading chart...</p>
            ) : (
                <>
                    {Array.isArray(data) && (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={90}
                                    fill="#8884d8"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {!Array.isArray(data) && (
                        <p className="text-red-500 text-sm text-center py-4">No gender distribution data available.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default GenderDistributionChart;
