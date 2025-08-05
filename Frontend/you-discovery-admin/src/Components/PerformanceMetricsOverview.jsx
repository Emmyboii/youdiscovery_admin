// components/PerformanceMetricsOverview.jsx
// import React, { useEffect, useState } from 'react';

const PerformanceMetricsOverview = ({ loading, data }) => {
    // const [metrics, setMetrics] = useState(null);
    // // const [loading, setLoading] = useState(false);

    // const fetchMetrics = async () => {
    //     setLoading(true);
    //     try {
    //         const token = localStorage.getItem('adminToken');
    //         const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/performance-metrics`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //         const data = await res.json();
    //         setMetrics(data);
    //     } catch (err) {
    //         console.error('Failed to fetch metrics:', err);
    //     } finally {
    //         // setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchMetrics();
    // }, []);

    return (
        <div className="bg-white w-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4">📊 Performance Metrics Overview</h2>

            {loading ? (
                <p className="text-gray-500">Loading metrics...</p>
            ) : data ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-gray-800">
                    <div className="p-4 border rounded-md">
                        <p className="font-medium">📈 Avg. Quiz Score</p>
                        <p className="text-[17px] font-bold">{data.averageQuizScore}%</p>
                    </div>

                    <div className="p-4 border rounded-md">
                        <p className="font-medium">✅ Avg. Completion Rate</p>
                        <p className="text-[17px] font-bold">{data.avgCompletionRate}%</p>
                    </div>

                    <div className="p-4 border rounded-md">
                        <p className="font-medium">🎓 Certificates Issued</p>
                        <p className="text-[17px] font-bold">{data.certificatesIssued}</p>
                    </div>

                    <div className="p-4 border rounded-md">
                        <p className="font-medium">🔥 Most Popular Course</p>
                        <p className="text-[17px] font-bold">{data.mostPopularCourse}</p>
                    </div>

                    <div className="p-4 border rounded-md sm:col-span-2">
                        <p className="font-medium">🧾 Most Completed Class</p>
                        <p className="text-[17px] font-bold">{data.mostCompletedClass}</p>
                    </div>

                    <div className="p-4 border rounded-md">
                        <p className="font-medium">📝 Most Completed Quiz</p>
                        <p className="text-[17px] font-bold">{data.mostCompletedQuiz}</p>
                    </div>
                </div>
            ) : (
                <p className="text-red-500">No data available.</p>
            )}
        </div>
    );
};

export default PerformanceMetricsOverview;
