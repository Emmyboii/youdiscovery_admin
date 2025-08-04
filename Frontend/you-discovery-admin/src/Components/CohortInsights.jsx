import React, { useEffect, useState } from 'react';

const CohortInsights = ({ loading, setLoading }) => {
    const [data, setData] = useState(null);

    const fetchInsights = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/cohort-insights`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error('Failed to fetch cohort insights:', err);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    return (
        <div className="w-full bg-white">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📊 Cohort-Based Insights</h2>

            {loading ? (
                <p>Loading insights...</p>
            ) : data ? (
                <>
                    <div className="mb-6">
                        <p className="text-lg">🔥 Most Engaged Cohort: <strong>{data.mostEngaged || 'N/A'}</strong></p>
                        <p className="text-lg">💤 Most Inactive Cohort: <strong>{data.mostInactive || 'N/A'}</strong></p>
                    </div>

                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.cohorts.map((c, i) => (
                            <div
                                key={i}
                                className="border border-gray-200 rounded-2xl p-4 shadow-md hover:shadow-lg transition duration-200"
                            >
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">{c.cohort}</h3>

                                <div className="text-sm text-gray-700 space-y-1">
                                    <p><strong>Total:</strong> {c.total}</p>
                                    <p><strong>Male:</strong> {c.male} | <strong>Female:</strong> {c.female}</p>
                                    <p className="mt-2 font-medium">📈 Age Distribution</p>
                                    <ul className="pl-4 list-disc">
                                        <li>15–20: {c.ageGroups['15–20']}</li>
                                        <li>21–25: {c.ageGroups['21–25']}</li>
                                        <li>26–30: {c.ageGroups['26–30']}</li>
                                        <li>31–35: {c.ageGroups['31–35']}</li>
                                        <li>36+: {c.ageGroups['36+']}</li>
                                    </ul>

                                    <p className="mt-2"><strong>✅ Completions:</strong> {c.completions}</p>
                                    <p><strong>🚫 Inactive:</strong> {c.inactive}</p>
                                    <p><strong>📊 Engagement:</strong> {c.engagementRate}%</p>
                                    <p><strong>😴 Inactivity:</strong> {c.inactivityRate}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p className="text-red-500">No data found.</p>
            )}
        </div>
    );
};

export default CohortInsights;
