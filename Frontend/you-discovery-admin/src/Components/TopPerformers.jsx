
const TopPerformers = ({ loading, data }) => {

    return (
        <div className="w-full bg-white">
            <h2 className="text-xl font-bold text-gray-700 mb-4">🏆 Top Performers</h2>

            {loading ? (
                <p>Loading leaderboard...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="px-4 py-2 text-left">Rank</th>
                                <th className="px-4 py-2 text-left">You Discoverer</th>
                                <th className="px-4 py-2">Quiz Avg</th>
                                <th className="px-4 py-2">Classes Completed</th>
                                <th className="px-4 py-2">Passed Quizzes</th>
                                <th className="px-4 py-2">Score</th>
                                <th className="px-4 py-2">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(data?.leaderboard) && data.leaderboard.length > 0 ? (
                                data.leaderboard.map((user) => (
                                    <tr key={user.userId} className="border-t">
                                        <td className="px-4 py-2 font-medium">{user.rank}</td>
                                        <td className="px-4 py-2">{user.name} <span className="text-xs text-gray-500">({user.email})</span></td>
                                        <td className="px-4 py-2 text-center">{user.avgScore}%</td>
                                        <td className="px-4 py-2 text-center">{user.blogsCompleted}</td>
                                        <td className="px-4 py-2 text-center">{user.passedQuizzes}</td>
                                        <td className="px-4 py-2 font-bold text-center">{user.score}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{new Date(user.dateJoined).toLocaleDateString("en-US", {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                                        No leaderboard data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TopPerformers;
