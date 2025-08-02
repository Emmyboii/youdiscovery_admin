// routes/users.js
import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../Models/userModel.js';
import { authMiddleware2, requireRole } from '../middleware/auth.js';

const createUserRoutes = async () => {

  const QuizAttempt = mongoose.models.quizattempts || mongoose.model('quizattempts', new mongoose.Schema({}, { strict: false }), 'quizattempts');
  const Blog = mongoose.models.blogs || mongoose.model('blogs', new mongoose.Schema({}, { strict: false }), 'blogs');
  const Chapter = mongoose.models.chapters || mongoose.model('chapters', new mongoose.Schema({}, { strict: false }), 'chapters');

  const router = Router();

  //Get all users
  router.get('/', authMiddleware2, async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  //Get each users
  router.get('/users/:id', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // 🟡 Admins only: Fetch users (with role protection)
  router.get('/users', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      let query = {};
      if (req.user.role === 'Cohort Admin' && req.user.cohortAssigned) {
        query.cohortApplied = req.user.cohortAssigned;
      }
      const users = await User.find(query);
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  router.get('/gender-distribution', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const { cohort } = req.query;

      const filter = {};

      // If cohort is provided and not empty string, apply it
      if (cohort && cohort.trim() !== '' && cohort !== 'All') {
        filter.cohortApplied = cohort.trim();
      }

      const users = await User.find(filter);

      // Count genders
      const male = users.filter(u => u.gender?.toLowerCase() === 'male').length;
      const female = users.filter(u => u.gender?.toLowerCase() === 'female').length;

      res.status(200).json({
        total: users.length,
        male,
        female,
      });
    } catch (err) {
      console.error("Error fetching gender distribution:", err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/age-segmentation', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const users = await User.find({ dateOfBirth: { $exists: true } });

      const now = new Date();
      const ageGroups = {
        '15-20': [],
        '21-25': [],
        '26-30': [],
        '31-35': [],
        '36+': [],
      };

      for (const user of users) {
        if (!user.dateOfBirth) continue;

        const birthDate = new Date(user.dateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();
        const completionRate = user.completionRate || 0; // % (0–100)
        const activityLevel = user.activityLevel || "Unknown"; // String label

        const userEntry = {
          id: user._id,
          fullName: `${user.firstName} ${user.lastName}`,
          age,
          activityLevel,
          completionRate,
        };

        if (age >= 15 && age <= 20) ageGroups['15-20'].push(userEntry);
        else if (age <= 25) ageGroups['21-25'].push(userEntry);
        else if (age <= 30) ageGroups['26-30'].push(userEntry);
        else if (age <= 35) ageGroups['31-35'].push(userEntry);
        else ageGroups['36+'].push(userEntry);
      }

      const total = users.length;

      const formatted = Object.entries(ageGroups).map(([range, group]) => {
        return {
          range,
          count: group.length,
          percent: total > 0 ? ((group.length / total) * 100).toFixed(1) : 0,
          avgCompletion: group.length > 0
            ? (group.reduce((sum, u) => sum + u.completionRate, 0) / group.length).toFixed(1)
            : 0,
          activityBreakdown: {
            High: group.filter(u => u.activityLevel === 'High').length,
            Moderate: group.filter(u => u.activityLevel === 'Moderate').length,
            Low: group.filter(u => u.activityLevel === 'Low').length,
            Inactive: group.filter(u => u.activityLevel === 'Inactive').length,
          },
        };
      });

      res.json(formatted);
    } catch (err) {
      console.error("Error in /age-segmentation:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // In routes/users.js
  router.get('/geographical-distribution', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const users = await User.find({});

      const countryMap = {};
      const nigeriaStates = {};
      const nigeriaCities = {};

      for (const user of users) {
        const country = user.country?.trim() || 'Unknown';
        const state = user.state?.trim() || 'Unknown';
        const city = user.city?.trim() || 'Unknown';

        // Count by country
        countryMap[country] = (countryMap[country] || 0) + 1;

        // Nigeria-specific breakdown
        if (country.toLowerCase() === 'nigeria') {
          nigeriaStates[state] = (nigeriaStates[state] || 0) + 1;
          nigeriaCities[city] = (nigeriaCities[city] || 0) + 1;
        }
      }

      res.json({
        byCountry: countryMap,
        nigeriaByState: nigeriaStates,
        nigeriaByCity: nigeriaCities
      });
    } catch (err) {
      console.error("Error in /geographical-distribution:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get('/engagement-analysis', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const { range = 'monthly' } = req.query;

      const groupFormat = {
        daily: { format: '%Y-%m-%d', label: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        weekly: { format: '%Y-%U', label: { $concat: [{ $toString: { $isoWeek: '$createdAt' } }, '-', { $toString: { $year: '$createdAt' } }] } },
        monthly: { format: '%Y-%m', label: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } },
      }[range];

      // 1. New Registrations
      const registrations = await User.aggregate([
        { $group: { _id: groupFormat.label, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', count: 1, _id: 0 } }
      ]);

      // 2. Quiz & Task Completions (using QuizAttempts and Blogs)
      const quizzes = await QuizAttempt.aggregate([
        { $match: { passed: true } },
        { $group: { _id: groupFormat.label, quizzes: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', quizzes: 1, _id: 0 } }
      ]);

      const tasks = await Blog.aggregate([
        { $match: { completedBy: { $exists: true, $ne: [] } } },
        { $unwind: '$completedBy' },
        { $group: { _id: groupFormat.label, tasks: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', tasks: 1, _id: 0 } }
      ]);

      // Merge completions by label
      const completionsMap = new Map();
      quizzes.forEach(item => completionsMap.set(item.label, { label: item.label, quizzes: item.quizzes, tasks: 0 }));
      tasks.forEach(item => {
        if (completionsMap.has(item.label)) {
          completionsMap.get(item.label).tasks = item.tasks;
        } else {
          completionsMap.set(item.label, { label: item.label, quizzes: 0, tasks: item.tasks });
        }
      });
      const completions = Array.from(completionsMap.values());

      // 3. Login Activity
      const logins = await User.aggregate([
        { $match: { lastLogin: { $exists: true } } },
        { $group: { _id: groupFormat.label, logins: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', logins: 1, _id: 0 } }
      ]);

      // 4. Active Users Trend (assume active = login in time period)
      const activeUsers = logins.map(entry => ({ label: entry.label, count: entry.logins }));

      // 5. Peak Period of Login
      const hourlyActivity = await User.aggregate([
        { $match: { lastLogin: { $exists: true } } },
        { $project: { hour: { $hour: '$lastLogin' } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
      const peakHour = hourlyActivity[0]?._id;
      let peakPeriod = 'Unknown';
      if (peakHour !== undefined) {
        peakPeriod = (peakHour >= 6 && peakHour <= 18) ? 'Day' : 'Night';
      }

      res.json({
        registrations,
        completions,
        logins,
        activeUsers,
        peakPeriod
      });
    } catch (err) {
      console.error('Engagement analysis error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/performance-metrics', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      // 1. Average Quiz Score
      const scores = await QuizAttempt.aggregate([
        { $group: { _id: null, averageScore: { $avg: '$score' } } }
      ]);
      const averageQuizScore = scores[0]?.averageScore?.toFixed(2) || 0;

      // 2. Average Completion Rate per Course
      const completionStats = await Chapter.aggregate([
        {
          $lookup: {
            from: 'blogs',
            localField: '_id',
            foreignField: 'chapter',
            as: 'blogs'
          }
        },
        { $unwind: '$blogs' },
        {
          $project: {
            chapter: '$_id',
            blog: '$blogs._id',
            completedBy: '$blogs.completedBy'
          }
        },
        {
          $group: {
            _id: '$chapter',
            totalBlogs: { $sum: 1 },
            totalCompletions: { $sum: { $size: { $ifNull: ['$completedBy', []] } } }
          }
        },
        {
          $project: {
            chapter: '$_id',
            _id: 0,
            averageCompletionRate: { $divide: ['$totalCompletions', '$totalBlogs'] }
          }
        }
      ]);
      const avgCompletionRate = (completionStats.reduce((a, b) => a + (b.averageCompletionRate || 0), 0) / (completionStats.length || 1)).toFixed(2);

      // 3. Number of Certificates Issued (assume users with isCertified = true)
      const certCount = await User.countDocuments({ isCertified: true });

      // 4. Most Popular Course/Module (by number of blogs or completions)
      const mostPopular = await Chapter.aggregate([
        {
          $lookup: {
            from: 'blogs',
            localField: '_id',
            foreignField: 'chapter',
            as: 'blogs'
          }
        },
        {
          $project: {
            title: 1,
            popularity: {
              $sum: { $map: { input: '$blogs', as: 'b', in: { $size: { $ifNull: ['$$b.completedBy', []] } } } }
            }
          },
        },
        { $sort: { popularity: -1 } },
        { $limit: 1 }
      ]);
      const mostPopularCourse = mostPopular[0]?.title || 'N/A';

      // 5. Most Completed Class/Quiz
      const topBlog = await Blog.aggregate([
        {
          $project: {
            title: 1,
            completions: { $size: { $ifNull: ['$completedBy', []] } }
          }
        },
        { $sort: { completions: -1 } },
        { $limit: 1 }
      ]);
      const mostCompletedClass = topBlog[0]?.title || 'N/A';

      const topQuiz = await QuizAttempt.aggregate([
        {
          $group: {
            _id: '$quiz',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: '_id',
            as: 'quizInfo'
          }
        },
        { $unwind: '$quizInfo' },
        {
          $project: {
            title: '$quizInfo.title',
            count: 1
          }
        }
      ]);
      const mostCompletedQuiz = topQuiz[0]?.title || 'N/A';

      res.json({
        averageQuizScore,
        avgCompletionRate,
        certificatesIssued: certCount,
        mostPopularCourse,
        mostCompletedClass,
        mostCompletedQuiz
      });
    } catch (err) {
      console.error('Performance metrics error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/cohort-insights', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const users = await User.find({ cohortApplied: { $exists: true, $ne: null } });

      const cohorts = [...new Set(users.map(u => u.cohortApplied))];

      const cohortStats = await Promise.all(
        cohorts.map(async cohort => {
          const group = users.filter(u => u.cohortApplied === cohort);
          const total = group.length;
          const male = group.filter(u => u.gender === 'male').length;
          const female = group.filter(u => u.gender === 'female').length;

          const ageGroups = {
            '15–20': 0,
            '21–25': 0,
            '26–30': 0,
            '31–35': 0,
            '36+': 0
          };

          for (const u of group) {
            const age = u.dateOfBirth ? Math.floor((Date.now() - new Date(u.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
            if (!age) continue;
            if (age <= 20) ageGroups['15–20']++;
            else if (age <= 25) ageGroups['21–25']++;
            else if (age <= 30) ageGroups['26–30']++;
            else if (age <= 35) ageGroups['31–35']++;
            else ageGroups['36+']++;
          }

          // Completion stats
          const blogs = await Blog.find({});
          const completedUsers = new Set();
          for (const blog of blogs) {
            for (const uid of blog.completedBy || []) {
              const user = group.find(u => u._id.equals(uid));
              if (user) completedUsers.add(uid.toString());
            }
          }

          const completions = completedUsers.size;
          const inactivity = group.filter(u => !u.lastLogin || new Date() - new Date(u.lastLogin) > 30 * 24 * 60 * 60 * 1000).length;

          return {
            cohort,
            total,
            male,
            female,
            ageGroups,
            completions,
            inactive: inactivity,
            engagementRate: (completions / total * 100).toFixed(1),
            inactivityRate: (inactivity / total * 100).toFixed(1)
          };
        })
      );

      // Find highest engagement/dropout cohorts
      const mostEngaged = [...cohortStats].sort((a, b) => b.engagementRate - a.engagementRate)[0]?.cohort;
      const mostInactive = [...cohortStats].sort((a, b) => b.inactivityRate - a.inactivityRate)[0]?.cohort;

      res.json({
        cohorts: cohortStats,
        mostEngaged,
        mostInactive
      });
    } catch (err) {
      console.error('Cohort insights error:', err);
      res.status(500).json({ error: 'Failed to fetch cohort insights' });
    }
  });

  router.get('/top-performers', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const users = await User.find({});
      const attempts = await QuizAttempt.find({});

      const performanceMap = {};
      for (const attempt of attempts) {
        const uid = attempt.user ? attempt.user.toString() : null;
        if (!uid) continue;
        if (!performanceMap[uid]) performanceMap[uid] = { scores: [], totalScore: 0 };
        performanceMap[uid].scores.push(attempt.score);
      }

      const leaderboard = users.map(user => {
        const perf = performanceMap[user._id.toString()] || { scores: [] };
        const avgScore = perf.scores.length
          ? (perf.scores.reduce((a, b) => a + b, 0) / perf.scores.length).toFixed(1)
          : 0;
        return {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avgScore: parseFloat(avgScore),
          consistency: user.consistency?.last30Days || 0,
          cohort: user.cohortApplied || 'Unassigned'
        };
      });

      const topByScore = [...leaderboard].sort((a, b) => b.avgScore - a.avgScore).slice(0, 10);
      const topByConsistency = [...leaderboard].sort((a, b) => b.consistency - a.consistency).slice(0, 10);

      res.json({ topByScore, topByConsistency });
    } catch (err) {
      console.error('Top performers error:', err);
      res.status(500).json({ error: 'Failed to fetch top performers' });
    }
  });

  router.get('/drop-off-tracking', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const users = await User.find({});

      const now = new Date();
      const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      const getLastActivity = (user) => {
        const blogDates = (user.completedBlogs || []).map(b => new Date(b.completedAt));
        const latestBlogDate = blogDates.length > 0 ? new Date(Math.max(...blogDates)) : null;

        if (latestBlogDate && user.updatedAt) {
          return latestBlogDate > user.updatedAt ? latestBlogDate : user.updatedAt;
        }
        return latestBlogDate || user.updatedAt || null;
      };

      const inactive14 = [];
      const inactive30 = [];

      for (const user of users) {
        const lastActivity = getLastActivity(user);

        if (!lastActivity || lastActivity < oneMonthAgo) {
          inactive30.push({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            cohort: user.cohortApplied || 'Unassigned',
            lastActivity,
            reason: user.inactiveReason || 'No reason provided'
          });
        } else if (lastActivity < twoWeeksAgo) {
          inactive14.push({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            cohort: user.cohortApplied || 'Unassigned',
            lastActivity,
            reason: user.inactiveReason || 'No reason provided'
          });
        }
      }

      res.json({
        inactive14Count: inactive14.length,
        inactive30Count: inactive30.length,
        detailed: [...inactive30, ...inactive14]
      });
    } catch (err) {
      console.error('Drop-off tracking error:', err);
      res.status(500).json({ error: 'Failed to fetch drop-off data' });
    }
  });


  // 🟡 Admins only: Update user in both DBs
  router.put('/users/:id', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin']), async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  // 🔴 Master Admin only: Delete user from both DBs
  router.delete('/users/:id', authMiddleware2, requireRole(['Master Admin', 'Super Admin']), async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
};

export default createUserRoutes;
