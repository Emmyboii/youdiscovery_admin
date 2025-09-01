// routes/stats.js
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const router = express.Router();

const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }), 'groups');
const Chapter = mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }), 'chapters');
const Blog = mongoose.model('Blog', new mongoose.Schema({}, { strict: false }), 'blogs');
const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }), 'quizzes');
const QuizAttempt = mongoose.model('quizattempts', new mongoose.Schema({}, { strict: false }), 'quizattempts');

router.get('/user/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).lean();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const [groups, chapters, blogs, quizzes] = await Promise.all([
            Group.find({}).lean(),
            Chapter.find({}).lean(),
            Blog.find({}).lean(),
            Quiz.find({}).lean(),
        ]);

        const attemptIds = user.quizAttempts?.map(id => new mongoose.Types.ObjectId(id)) || [];
        const quizAttempts = await QuizAttempt.find({ _id: { $in: attemptIds } }).lean();

        const chapterToGroup = {}, blogToChapter = {}, blogToGroup = {}, quizToBlog = {}, quizMap = {};

        chapters.forEach(ch => {
            chapterToGroup[ch._id.toString()] = ch.group?.toString();
        });

        blogs.forEach(blog => {
            const blogId = blog._id.toString();
            const chapterId = blog.chapter?.toString();
            blogToChapter[blogId] = chapterId;
            blogToGroup[blogId] = chapterToGroup[chapterId];
        });

        quizzes.forEach(q => {
            const quizId = q._id.toString();
            quizToBlog[quizId] = q.blog?.toString();
            quizMap[quizId] = q;
        });

        const completedBlogIds = user.completedBlogs?.map(cb => cb.blog?.toString()) || [];
        const completedBlogSet = new Set(completedBlogIds);

        const completedChapterSet = new Set();
        chapters.forEach(ch => {
            const chapterId = ch._id.toString();
            const chapterBlogs = blogs.filter(b => b.chapter?.toString() === chapterId);
            if (chapterBlogs.length > 0) {
                const allDone = chapterBlogs.every(b => completedBlogSet.has(b._id.toString()));
                if (allDone) completedChapterSet.add(chapterId);
            }
        });

        const completedGroupSet = new Set();
        groups.forEach(group => {
            const groupId = group._id.toString();
            const groupChapters = chapters.filter(ch => ch.group?.toString() === groupId);
            const chaptersWithBlogs = groupChapters.filter(ch =>
                blogs.some(b => b.chapter?.toString() === ch._id.toString())
            );

            const allCompleted = chaptersWithBlogs.every(ch =>
                completedChapterSet.has(ch._id.toString())
            );

            if (chaptersWithBlogs.length > 0 && allCompleted) {
                completedGroupSet.add(groupId);
            }
        });

        const courseStats = {};
        groups.forEach(group => {
            const id = group._id.toString();
            courseStats[id] = {
                groupId: id,
                groupTitle: group.title,
                quizzesTotal: 0,
                quizzesAttempted: 0,
                quizzesPassed: 0,
                quizzesScoreSum: 0,
                quizAverage: 0,
                classesTotal: 0,
                classesCompleted: 0,
                chaptersTotal: 0,
                chaptersCompleted: 0,
            };
        });

        blogs.forEach(blog => {
            const groupId = blogToGroup[blog._id.toString()];
            if (groupId && courseStats[groupId]) {
                courseStats[groupId].classesTotal += 1;
            }
        });

        completedBlogIds.forEach(blogId => {
            const groupId = blogToGroup[blogId];
            if (groupId && courseStats[groupId]) {
                courseStats[groupId].classesCompleted += 1;
            }
        });

        chapters.forEach(ch => {
            const groupId = ch.group?.toString();
            if (groupId && courseStats[groupId]) {
                courseStats[groupId].chaptersTotal += 1;
                if (completedChapterSet.has(ch._id.toString())) {
                    courseStats[groupId].chaptersCompleted += 1;
                }
            }
        });

        quizzes.forEach(quiz => {
            const blogId = quizToBlog[quiz._id.toString()];
            const groupId = blogToGroup[blogId];
            if (groupId && courseStats[groupId]) {
                courseStats[groupId].quizzesTotal += 1;
            }
        });

        let passedCount = 0;
        const validAttempts = quizAttempts.filter(a => typeof a.score === 'number');
        const scoreSum = validAttempts.reduce((sum, a) => sum + a.score, 0);

        validAttempts.forEach(attempt => {
            const quizId = attempt.quiz?.toString();
            const quiz = quizMap[quizId];
            if (!quiz) return;

            const blogId = quiz.blog?.toString();
            const groupId = blogToGroup[blogId];
            const score = Number(attempt.score) || 0;

            if (groupId && courseStats[groupId]) {
                courseStats[groupId].quizzesAttempted += 1;
                courseStats[groupId].quizzesPassed += attempt.isPassed ? 1 : 0;
                courseStats[groupId].quizzesScoreSum += score;
            }

            if (attempt.isPassed) passedCount += 1;
        });

        Object.values(courseStats).forEach(stat => {
            stat.quizAverage = stat.quizzesAttempted > 0
                ? parseFloat((stat.quizzesScoreSum / stat.quizzesAttempted).toFixed(1))
                : 0;
        });

        const totalAttempts = attemptIds.length;
        const quizAverage = validAttempts.length > 0
            ? parseFloat((scoreSum / validAttempts.length).toFixed(1))
            : 0;

        // 🧠 Consistency & Chart
        const dailyMap = {};
        user.completedBlogs?.forEach(cb => {
            const dateStr = new Date(cb.completedAt).toISOString().slice(0, 10);
            dailyMap[dateStr] = true;
        });

        const generatePastDays = (n) => {
            const days = [];
            const today = new Date();
            for (let i = 0; i < n; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                days.push(d.toISOString().slice(0, 10));
            }
            return days;
        };

        const calcConsistency = (days) => {
            const active = days.filter(d => dailyMap[d]).length;
            return +(active / days.length * 100).toFixed(1);
        };

        const days7 = generatePastDays(7);
        const days30 = generatePastDays(30);
        const days90 = generatePastDays(90);

        const consistency7 = calcConsistency(days7);
        const consistency30 = calcConsistency(days30);
        const consistency90 = calcConsistency(days90);

        const badge =
            consistency7 >= 90 ? '🔥 Consistent Learner'
                : consistency7 >= 70 ? '✅ Active Participant'
                    : consistency7 >= 40 ? '📘 Getting There'
                        : '💤 Student Needs Motivation';

        const chartDays = days90.reverse(); // show in ascending order
        const activityChartData = chartDays.map(date => ({
            date,
            completed: dailyMap[date] ? 1 : 0
        }));

        const finalStats = {
            userId: user._id,
            name: `${user.firstName} ${user.lastName}`,

            totalCourses: groups.length,
            coursesCompleted: completedGroupSet.size,

            totalQuizzes: quizzes.length,
            quizzesAttempted: totalAttempts,
            quizzesPassed: passedCount,
            quizAverage,

            totalClasses: blogs.length,
            completedClasses: completedBlogIds.length,

            totalChapters: chapters.length,
            completedChapters: completedChapterSet.size,

            perCourseStats: Object.values(courseStats),

            consistency: {
                last7Days: consistency7,
                last30Days: consistency30,
                last90Days: consistency90,
                badge
            },

            activityChartData // 👈 chart-ready data
        };

        res.json(finalStats);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
