// routes/stats.js
import express from 'express';
import mongoose from 'mongoose';
import User from '../Models/userModel.js';

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

        // Fetch only the attempts listed in user.quizAttempts
        const attemptIds = user.quizAttempts?.map(id => new mongoose.Types.ObjectId(id)) || [];
        const quizAttempts = await QuizAttempt.find({ _id: { $in: attemptIds } }).lean();

        // Mappings
        const chapterToGroup = {};
        const blogToChapter = {};
        const blogToGroup = {};
        const quizToBlog = {};
        const quizMap = {};

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

        // Completed blog IDs
        const completedBlogIds = user.completedBlogs?.map(cb => cb.blog?.toString()) || [];
        const completedBlogSet = new Set(completedBlogIds);

        // ✅ Completed Chapters = All blogs in chapter completed
        const completedChapterSet = new Set();
        chapters.forEach(ch => {
            const chapterId = ch._id.toString();
            const chapterBlogs = blogs.filter(b => b.chapter?.toString() === chapterId);
            if (chapterBlogs.length > 0) {
                const allDone = chapterBlogs.every(b => completedBlogSet.has(b._id.toString()));
                if (allDone) completedChapterSet.add(chapterId);
            }
        });

        // ✅ Completed Courses = All chapters with blogs in course completed
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

        // Course statistics init
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

        // Classes count
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

        // Chapters count
        chapters.forEach(ch => {
            const groupId = ch.group?.toString();
            if (groupId && courseStats[groupId]) {
                courseStats[groupId].chaptersTotal += 1;
                if (completedChapterSet.has(ch._id.toString())) {
                    courseStats[groupId].chaptersCompleted += 1;
                }
            }
        });

        // Quizzes count
        quizzes.forEach(quiz => {
            const blogId = quizToBlog[quiz._id.toString()];
            const groupId = blogToGroup[blogId];
            if (groupId && courseStats[groupId]) {
                courseStats[groupId].quizzesTotal += 1;
            }
        });

        // Process Attempts
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

        // Compute per-course averages
        Object.values(courseStats).forEach(stat => {
            stat.quizAverage = stat.quizzesAttempted > 0
                ? parseFloat((stat.quizzesScoreSum / stat.quizzesAttempted).toFixed(1))
                : 0;
        });

        // Final stats
        const totalAttempts = attemptIds.length;
        const quizAverage = validAttempts.length > 0
            ? parseFloat((scoreSum / validAttempts.length).toFixed(1))
            : 0;

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
        };

        res.json(finalStats);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
