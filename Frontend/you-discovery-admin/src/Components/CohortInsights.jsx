    const CohortInsights = ({ loading, data }) => {
        return (
            <div className="w-full bg-white rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Cohort-Based Insights</h2>

                {loading ? (
                    <p className="text-center text-gray-500">Loading insights...</p>
                ) : data ? (
                    <>
                        {/* Highlights */}
                        <div className="flex flex-col sm:flex-row gap-6 mb-8">
                            <div className="flex-1 bg-green-100 text-green-800 p-4 rounded-xl shadow">
                                <p className="text-lg font-semibold">🔥 Most Engaged Cohort</p>
                                <p className="text-2xl font-bold">{data.mostEngaged || 'N/A'}</p>
                            </div>
                            <div className="flex-1 bg-red-100 text-red-800 p-4 rounded-xl shadow">
                                <p className="text-lg font-semibold">💤 Most Inactive Cohort</p>
                                <p className="text-2xl font-bold">{data.mostInactive || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Cohort cards */}
                        {Array.isArray(data.cohorts) && data.cohorts.length > 0 ? (
                            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.cohorts.map((c, i) => (
                                    <div
                                        key={i}
                                        className="border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition duration-200"
                                    >
                                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Cohort {c.cohort}</h3>

                                        <div className="text-sm text-gray-700 space-y-1">
                                            <p><strong>Total Participants:</strong> {c.total}</p>
                                            <p><strong>Gender:</strong> Male {c.male} | Female {c.female}</p>

                                            <p className="mt-2 font-medium">📈 Age Distribution</p>
                                            <ul className="pl-4 list-disc">
                                                <li>15–20: {c.ageGroups?.['15–20'] ?? 0}</li>
                                                <li>21–25: {c.ageGroups?.['21–25'] ?? 0}</li>
                                                <li>26–30: {c.ageGroups?.['26–30'] ?? 0}</li>
                                                <li>31–35: {c.ageGroups?.['31–35'] ?? 0}</li>
                                                <li>36+: {c.ageGroups?.['36+'] ?? 0}</li>
                                            </ul>

                                            <p className="mt-2"><strong>✅ Completions:</strong> {c.completions}</p>
                                            <p><strong>🚫 Inactive:</strong> {c.inactive}</p>
                                            <p><strong>📊 Engagement:</strong> {c.engagementRate}%</p>
                                            <p><strong>😴 Inactivity:</strong> {c.inactivityRate}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-red-500">No cohort data found.</p>
                        )}
                    </>
                ) : (
                    <p className="text-red-500">No data found.</p>
                )}
            </div>
        );
    };

    export default CohortInsights;