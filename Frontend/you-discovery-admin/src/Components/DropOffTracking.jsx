import React, { useEffect, useState } from 'react';

const DropOffTracking = ({ loading, setLoading }) => {
    const [dropOffData, setDropOffData] = useState(null);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDropOffData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/drop-off-tracking`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                    },
                });
                const data = await res.json();
                setDropOffData(data);
            } catch (err) {
                console.error('Failed to fetch drop-off tracking data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDropOffData();
    }, []);

    if (loading) {
        return <p className="text-center py-10 text-gray-500">Loading drop-off data...</p>;
    }

    if (!dropOffData) {
        return <p className="text-center py-10 text-red-500">Error loading drop-off data.</p>;
    }

    return (
        <div className="bg-white w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📉 Drop-Off Tracking</h2>

            <div className="mb-6 flex gap-10">
                <p className="text-gray-700">
                    <span className="font-medium">Inactive for 2+ weeks:</span>{' '}
                    <span className="text-yellow-600">{dropOffData.inactive14Count}</span>
                </p>
                <p className="text-gray-700">
                    <span className="font-medium">Inactive for 1+ month:</span>{' '}
                    <span className="text-red-600">{dropOffData.inactive30Count}</span>
                </p>
            </div>

            {/* <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2">Name</th>
                            <th className="border px-4 py-2">Email</th>
                            <th className="border px-4 py-2">Cohort</th>
                            <th className="border px-4 py-2">Last Activity</th>
                            <th className="border px-4 py-2">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dropOffData.detailed.map((user, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{user.name}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">{user.cohort}</td>
                                <td className="border px-4 py-2">
                                    {user.lastActivity
                                        ? new Date(user.lastActivity).toLocaleDateString()
                                        : 'No Activity'}
                                </td>
                                <td className="border px-4 py-2 text-gray-600">{user.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> */}
        </div>
    );
};

export default DropOffTracking;
