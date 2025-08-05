import React, { useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#f59e0b"]; // Blue & Yellow

const GenderDistributionChart = ({ loading, data }) => {
    const [cohort, setCohort] = useState('');
    // const [data, setData] = useState([]);

    // const fetchGenderData = async () => {

    //     const token = localStorage.getItem('adminToken')
    //     if (!token) {
    //         console.warn('No token found');
    //         return;
    //     }

    //     setLoading(true);
    //     try {
    //         const res = await fetch(
    //             `${process.env.REACT_APP_BACKEND_URL}/api/gender-distribution?cohort=${cohort}`
    //             , {
    //                 method: 'GET',
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                     Accept: 'application/json',
    //                     'Content-Type': 'application/json'
    //                 },
    //             })
    //         const result = await res.json();

    //         setData([
    //             { name: "Male", value: result.male },
    //             { name: "Female", value: result.female },
    //         ]);
    //     } catch (err) {
    //         console.error("Error fetching gender distribution:", err);
    //     } finally {
    //         // setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchGenderData();
    // }, [cohort]);

    return (
        <div className="bg-white w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl w-full font-bold text-gray-700">👥 Gender Distribution</h2>

                <input
                    type="text"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    placeholder="Enter cohort number"
                    className="border rounded px-3 py-2 text-sm w-[1/3]"
                />
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
