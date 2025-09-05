import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#f59e0b"]; // Blue & Yellow

const GenderDistributionChart = ({ loading }) => {
    const [cohort, setCohort] = useState("");
    const [dateJoined, setDateJoined] = useState("");
    const [stats, setStats] = useState({ total: 0, male: 0, female: 0 });

    const chartData = useMemo(
        () => [
            { name: "Male", value: stats.male },
            { name: "Female", value: stats.female },
        ],
        [stats]
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const params = new URLSearchParams();
                if (cohort) params.append("cohort", cohort);
                if (dateJoined) params.append("dateJoined", dateJoined);

                const res = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/gender-distribution?${params.toString()}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const result = await res.json();

                // Expecting { total, male, female }
                setStats({
                    total: result?.total ?? 0,
                    male: result?.male ?? 0,
                    female: result?.female ?? 0,
                });
            } catch (e) {
                console.error("Error fetching gender distribution:", e);
                setStats({ total: 0, male: 0, female: 0 });
            }
        };

        fetchData();
    }, [cohort, dateJoined]);

    return (
        <div className="bg-white w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl w-full font-bold text-gray-700">👥 Gender Distribution</h2>

                <div className="flex sp:flex-row flex-col gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        value={cohort}
                        onChange={(e) => setCohort(e.target.value)}
                        placeholder="Enter cohort number"
                        className="border rounded px-3 py-2 text-sm w-[150px]"
                    />
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
            ) : stats.total > 0 ? (
                <>
                    <div className="text-center mb-3">
                        <p className="font-medium">Total Users: {stats.total}</p>
                        <p>
                            Male: {stats.male} | Female: {stats.female}
                        </p>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} users`, name]} />
                        </PieChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <p className="text-red-500 text-sm text-center py-4">No gender distribution data available.</p>
            )}
        </div>
    );
};

export default GenderDistributionChart;
