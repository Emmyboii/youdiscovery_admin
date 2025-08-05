// components/TopPerformers.jsx
// import React, { useEffect, useState } from 'react';

const TopPerformers = ({ loading, data }) => {
    // const [data, setData] = useState({ topByScore: [], topByConsistency: [] });
    // // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchTop = async () => {
    //         setLoading(true)
    //         try {
    //             const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/top-performers`, {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
    //                 },
    //             });
    //             const result = await res.json();
    //             setData(result);
    //         } catch (err) {
    //             console.error('Error loading top performers:', err);
    //         } finally {
    //             // setLoading(false);
    //         }
    //     };

    //     fetchTop();
    // }, []);

    return (
        <div className="w-full bg-white">
            <h2 className="text-xl font-bold text-gray-700 mb-4">🏆 Top Performers</h2>

            {loading ? (
                <p>Loading leaderboard...</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Top by Quiz Score</h3>
                        <ol className="list-decimal list-inside text-sm space-y-1">
                            {Array.isArray(data?.topByScore) ? (
                                data.topByScore.map((user, i) => (
                                    <li key={i}>
                                        <span className="font-medium">{user.name}</span> ({user.email}) – Avg Score:{' '}
                                        <strong>{user.avgScore}%</strong>
                                    </li>
                                ))
                            ) : (
                                <li>No data available</li>
                            )}

                        </ol>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2">Top by Consistency</h3>
                        <ol className="list-decimal list-inside text-sm space-y-1">
                            {Array.isArray(data?.topByConsistency) ? (
                                data.topByConsistency.map((user, i) => (
                                    <li key={i}>
                                        <span className="font-medium">{user.name}</span> ({user.email}) – 30-Day Consistency:{' '}
                                        <strong>{user.consistency}%</strong>
                                    </li>
                                ))
                            ) : (
                                <li>No data available</li>
                            )}

                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopPerformers;
