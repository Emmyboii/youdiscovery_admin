// routes/users.js
import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
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
  router.get(
    '/users/:id',
    authMiddleware2,
    requireRole([
      'Super Admin',
      'CRM/Admin Support',
      'Academic/Admin Coordinator',
      'Analytics & Reporting Admin',
      'Partnerships/Admin for B2B/B2G'
    ]),
    async (req, res) => {
      try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    }
  );


  // 🟡 Admins only: Fetch users (with role protection)
  router.get(
    '/users',
    authMiddleware2,
    requireRole([
      'Analytics & Reporting Admin',
      'Super Admin',
      'CRM/Admin Support',
      'Academic/Admin Coordinator',
      'Community Manager',
      'Developer/System Admin',
      'Partnerships/Admin for B2B/B2G'
    ]), async (req, res) => {
      try {
        let query = {};
        if (req.user.role === 'Partnerships/Admin for B2B/B2G' && req.user.cohortAssigned) {
          query.cohortApplied = req.user.cohortAssigned;
        }
        const users = await User.find(query);
        res.json(users);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    });

  router.get(
    '/class-completions',
    authMiddleware2,
    requireRole([
      'Super Admin',
      'CRM/Admin Support',
      'Academic/Admin Coordinator',
      'Analytics & Reporting Admin',
      'Partnerships/Admin for B2B/B2G',
    ]),
    async (req, res) => {
      try {
        // Aggregate all completedBlogs across users.
        // We expect user.completedBlogs to be an array of { blog: ObjectId, completedAt: Date }
        const pipeline = [
          // Ensure users have completedBlogs
          { $match: { completedBlogs: { $exists: true, $ne: [] } } },

          // unwind each completed entry
          { $unwind: '$completedBlogs' },

          // project the completedAt as a Date (attempt to convert string -> date if needed)
          {
            $project: {
              completedAt: {
                $cond: [
                  { $ifNull: ['$completedBlogs.completedAt', false] },
                  { $toDate: '$completedBlogs.completedAt' },
                  null,
                ],
              },
            },
          },

          // filter out null dates
          { $match: { completedAt: { $type: 'date' } } },

          // facet to compute multiple groupings in one pass
          {
            $facet: {
              daily: [
                {
                  $group: {
                    _id: {
                      $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, date: '$_id', count: 1 } },
              ],

              weekly: [
                {
                  $group: {
                    _id: {
                      year: { $isoWeekYear: '$completedAt' },
                      week: { $isoWeek: '$completedAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { '_id.year': 1, '_id.week': 1 } },
                {
                  $project: {
                    _id: 0,
                    week: {
                      $concat: [
                        { $toString: '$_id.year' },
                        '-W',
                        { $toString: '$_id.week' },
                      ],
                    },
                    count: 1,
                  },
                },
              ],

              monthly: [
                {
                  $group: {
                    _id: {
                      $dateToString: { format: '%Y-%m', date: '$completedAt' },
                    },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, month: '$_id', count: 1 } },
              ],

              hourly: [
                {
                  $group: {
                    _id: { hour: { $hour: '$completedAt' } },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { '_id.hour': 1 } },
                { $project: { _id: 0, hour: '$_id.hour', count: 1 } },
              ],
            },
          },
        ];

        const [aggResult] = await User.aggregate(pipeline).allowDiskUse(true);

        // If no results (no completed items), return empty shapes
        const daily = aggResult?.daily || [];
        const weekly = aggResult?.weekly || [];
        const monthly = aggResult?.monthly || [];
        const hourlyAgg = aggResult?.hourly || [];

        // Build hourlyCounts array having 0..23 entries (fill missing hours with count 0)
        const hourlyCounts = Array.from({ length: 24 }, (_, h) => {
          const found = hourlyAgg.find((x) => x.hour === h);
          return { hour: h, count: found ? found.count : 0 };
        });

        // compute daytime/nighttime counts
        // define daytime as hours 6..17 (6:00 - 17:59), night as 18..5
        const daytimeCount = hourlyCounts
          .filter((h) => h.hour >= 6 && h.hour < 18)
          .reduce((s, x) => s + x.count, 0);
        const nighttimeCount = hourlyCounts
          .filter((h) => h.hour < 6 || h.hour >= 18)
          .reduce((s, x) => s + x.count, 0);

        const peakTime = daytimeCount >= nighttimeCount ? 'Day' : 'Night';

        return res.json({
          daily,
          weekly,
          monthly,
          peakTime,
          dayCount: daytimeCount,
          nightCount: nighttimeCount,
          hourlyCounts,
          daytimeCount,
          nighttimeCount,
        });
      } catch (err) {
        console.error('class-completions error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
    }
  );

  // GET /api/gender-distribution
  router.get(
    '/gender-distribution',
    authMiddleware2,
    requireRole([
      'Super Admin',
      'CRM/Admin Support',
      'Academic/Admin Coordinator',
      'Analytics & Reporting Admin',
      'Partnerships/Admin for B2B/B2G'
    ]),
    async (req, res) => {
      try {
        const { cohort, dateJoined } = req.query;

        const filter = {};
        if (cohort) filter.cohortApplied = cohort;

        if (dateJoined) {
          const startOfDay = new Date(dateJoined);
          const endOfDay = new Date(dateJoined);
          endOfDay.setHours(23, 59, 59, 999);
          filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const users = await User.find(filter).lean();

        const male = users.filter(u => u.gender?.toLowerCase() === 'male').length;
        const female = users.filter(u => u.gender?.toLowerCase() === 'female').length;
        const total = users.length;

        // Return a simple object; frontend will build chart data from this
        res.status(200).json({ total, male, female });
      } catch (err) {
        console.error('Error fetching gender distribution:', err);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

  router.get('/age-segmentation', authMiddleware2, requireRole([
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Analytics & Reporting Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
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
  router.get('/geographical-distribution', authMiddleware2, requireRole([
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Analytics & Reporting Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
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

  router.get('/engagement-analysis', authMiddleware2, requireRole([
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Analytics & Reporting Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
    try {
      const { range = 'monthly' } = req.query;

      const groupFormat = {
        daily: { format: '%Y-%m-%d', label: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        weekly: {
          format: '%Y-%U',
          label: {
            $concat: [
              { $toString: { $isoWeek: '$createdAt' } },
              '-',
              { $toString: { $year: '$createdAt' } }
            ]
          }
        },
        monthly: { format: '%Y-%m', label: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } }
      }[range];

      const completedGroupFormat = {
        daily: { format: '%Y-%m-%d', label: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } } },
        weekly: {
          format: '%Y-%U',
          label: {
            $concat: [
              { $toString: { $isoWeek: '$completedAt' } },
              '-',
              { $toString: { $year: '$completedAt' } }
            ]
          }
        },
        monthly: { format: '%Y-%m', label: { $dateToString: { format: '%Y-%m', date: '$completedAt' } } }
      }[range];

      // 1. Registrations
      const registrations = await User.aggregate([
        { $project: { createdAt: 1, label: groupFormat.label } },
        { $group: { _id: '$label', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', count: 1, _id: 0 } }
      ]);

      // 2. Quiz Attempts - Passed
      const passedAgg = await QuizAttempt.aggregate([
        { $match: { isPassed: true, completedAt: { $exists: true } } },
        { $project: { label: completedGroupFormat.label } },
        { $group: { _id: '$label', passed: { $sum: 1 } } }
      ]);

      // 3. Quiz Attempts - Attempted
      const attemptedAgg = await QuizAttempt.aggregate([
        { $match: { completedAt: { $exists: true } } },
        { $project: { label: completedGroupFormat.label } },
        { $group: { _id: '$label', attempted: { $sum: 1 } } }
      ]);

      const completionMap = new Map();
      attemptedAgg.forEach(item => {
        completionMap.set(item._id, {
          label: item._id,
          passed: 0,
          attempted: item.attempted
        });
      });
      passedAgg.forEach(item => {
        if (completionMap.has(item._id)) {
          completionMap.get(item._id).passed = item.passed;
        } else {
          completionMap.set(item._id, {
            label: item._id,
            passed: item.passed,
            attempted: 0
          });
        }
      });
      const completions = Array.from(completionMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      );

      // 4. Logins
      const logins = await User.aggregate([
        { $match: { lastLogin: { $exists: true } } },
        { $project: { label: groupFormat.label } },
        { $group: { _id: '$label', logins: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', logins: 1, _id: 0 } }
      ]);

      // 5. Active Users — Trend
      const activeUsersTrend = await User.aggregate([
        { $match: { isActive: true } },
        { $project: { createdAt: 1, label: groupFormat.label } },
        { $group: { _id: '$label', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { label: '$_id', count: 1, _id: 0 } }
      ]);

      // 6. Active Users — Total Count
      const activeUsersTotal = await User.countDocuments({ isActive: true });

      // 7. Peak Login Period
      const hourlyActivity = await User.aggregate([
        { $match: { lastLogin: { $exists: true } } },
        { $project: { hour: { $hour: '$lastLogin' } } },
        { $group: { _id: '$hour', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      const peakHour = hourlyActivity[0]?._id;
      const peakPeriod =
        peakHour === undefined
          ? 'Unknown'
          : peakHour >= 6 && peakHour <= 18
            ? 'Day'
            : 'Night';

      res.json({
        registrations,
        completions,
        logins,
        activeUsersTrend,
        activeUsersTotal,
        peakPeriod
      });
    } catch (err) {
      console.error('Engagement analysis error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/performance-metrics', authMiddleware2, requireRole([
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Analytics & Reporting Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
    try {
      // 1. Average Quiz Score
      const scores = await QuizAttempt.aggregate([
        { $match: { score: { $exists: true } } },
        { $group: { _id: null, averageScore: { $avg: '$score' } } }
      ]);
      const averageQuizScore = scores[0]?.averageScore?.toFixed(2) || 0;

      // 2. Average Completion Rate per Chapter (based on completedAt in QuizAttempt)
      const chapterCompletions = await QuizAttempt.aggregate([
        {
          $match: { completedAt: { $exists: true } }
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quiz',
            foreignField: '_id',
            as: 'quiz'
          }
        },
        { $unwind: '$quiz' },
        {
          $lookup: {
            from: 'blogs',
            localField: 'quiz.blog',
            foreignField: '_id',
            as: 'blog'
          }
        },
        { $unwind: '$blog' },
        {
          $lookup: {
            from: 'chapters',
            localField: 'blog.chapter',
            foreignField: '_id',
            as: 'chapter'
          }
        },
        { $unwind: '$chapter' },
        {
          $group: {
            _id: '$chapter._id',
            completions: { $sum: 1 }
          }
        }
      ]);

      const totalChapters = await Chapter.countDocuments();
      const totalCompletions = chapterCompletions.reduce((sum, ch) => sum + ch.completions, 0);
      const avgCompletionRate = (totalChapters ? totalCompletions / totalChapters : 0).toFixed(2);

      // 3. Total certificates issued (sum of all certificatesEarned)
      const result = await User.aggregate([
        {
          $group: {
            _id: null,
            totalCertificates: { $sum: "$certificatesEarned" }
          }
        }
      ]);
      const certCount = result.length > 0 ? result[0].totalCertificates : 0;

      // 4. Most Popular Course (by quiz completions)
      const popularCourse = await Chapter.aggregate([
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
          $lookup: {
            from: 'quizzes',
            localField: 'blogs._id',
            foreignField: 'blog',
            as: 'quiz'
          }
        },
        { $unwind: '$quiz' },
        {
          $lookup: {
            from: 'quizattempts',
            localField: 'quiz._id',
            foreignField: 'quiz',
            as: 'attempts'
          }
        },
        {
          $project: {
            title: '$title',
            totalCompletions: { $size: { $ifNull: ['$attempts', []] } }
          }
        },
        { $sort: { totalCompletions: -1 } },
        { $limit: 1 }
      ]);
      const mostPopularCourse = popularCourse[0]?.title || 'N/A';

      // 5. Most Completed Class
      const mostCompletedClassAgg = await Blog.aggregate([
        {
          $lookup: {
            from: 'quizattempts',
            localField: '_id',
            foreignField: 'quiz',
            as: 'attempts'
          }
        },
        {
          $project: {
            title: 1,
            completions: {
              $size: {
                $filter: {
                  input: '$attempts',
                  as: 'attempt',
                  cond: { $ifNull: ['$$attempt.completedAt', false] }
                }
              }
            }
          }
        },
        { $sort: { completions: -1 } },
        { $limit: 1 }
      ]);
      const mostCompletedClass = mostCompletedClassAgg[0]?.title || 'N/A';

      // 6. Most Completed Quiz
      const topQuiz = await QuizAttempt.aggregate([
        {
          $match: { completedAt: { $exists: true } }
        },
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
            title: '$quizInfo.quizTitle',
            count: 1
          }
        }
      ]);
      const mostCompletedQuiz = topQuiz[0]?.title || 'N/A';

      // Final Response
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

  router.get(
    '/cohort-insights',
    authMiddleware2,
    requireRole([
      'Super Admin',
      'CRM/Admin Support',
      'Academic/Admin Coordinator',
      'Analytics & Reporting Admin',
      'Partnerships/Admin for B2B/B2G'
    ]),
    async (req, res) => {
      try {
        const users = await User.find({ cohortApplied: { $exists: true, $ne: null } });
        const cohorts = [...new Set(users.map(u => u.cohortApplied))];

        const cohortStats = await Promise.all(
          cohorts.map(async cohort => {
            const group = users.filter(u => u.cohortApplied === cohort);
            const total = group.length;

            const male = group.filter(u => u.gender?.toLowerCase() === 'male').length;
            const female = group.filter(u => u.gender?.toLowerCase() === 'female').length;

            // ---- Age Groups ----
            const ageGroups = { '15–20': 0, '21–25': 0, '26–30': 0, '31–35': 0, '36+': 0 };
            for (const u of group) {
              if (!u.dateOfBirth) continue;
              const age = Math.floor(
                (Date.now() - new Date(u.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
              );
              if (age <= 20) ageGroups['15–20']++;
              else if (age <= 25) ageGroups['21–25']++;
              else if (age <= 30) ageGroups['26–30']++;
              else if (age <= 35) ageGroups['31–35']++;
              else ageGroups['36+']++;
            }

            // ---- Blog completions ----
            const blogs = await Blog.find({});
            const completedUsers = new Set();
            let completions = 0;

            for (const blog of blogs) {
              for (const uid of blog.completedBy || []) {
                if (group.find(u => u._id.equals(uid))) {
                  completedUsers.add(uid.toString());
                  completions++; // count total completions, not just unique users
                }
              }
            }

            // ---- Quiz activity ----
            const userIds = group.map(u => u._id.toString());
            const quizAttempts = await QuizAttempt.find({ user: { $in: userIds } });
            const quizActiveUsers = new Set(quizAttempts.map(q => q.user.toString()));

            // ---- Engagement (blog OR quiz) ----
            const engagedUsers = new Set([...completedUsers, ...quizActiveUsers]);
            const engagedCount = engagedUsers.size;

            // ---- Inactivity (no blogs, no quiz) ----
            const inactive = total - engagedCount;

            const engagementRate = total > 0 ? ((engagedCount / total) * 100).toFixed(1) : 0;
            const inactivityRate = total > 0 ? ((inactive / total) * 100).toFixed(1) : 0;

            return {
              cohort,
              total,
              male,
              female,
              ageGroups,
              completions, // total blogs completed across all users in the cohort
              engaged: engagedCount,
              inactive,
              engagementRate: parseFloat(engagementRate),
              inactivityRate: parseFloat(inactivityRate)
            };
          })
        );

        const mostEngaged = cohortStats.reduce(
          (max, c) => (c.engagementRate > max.engagementRate ? c : max),
          cohortStats[0]
        );
        const mostInactive = cohortStats.reduce(
          (max, c) => (c.inactivityRate > max.inactivityRate ? c : max),
          cohortStats[0]
        );

        res.json({
          cohorts: cohortStats,
          mostEngaged: mostEngaged?.cohort || null,
          mostInactive: mostInactive?.cohort || null
        });
      } catch (err) {
        console.error('Cohort insights error:', err);
        res.status(500).json({ error: 'Failed to fetch cohort insights' });
      }
    }
  );

  // routes/topPerformers.js
  router.get(
    "/top-performers",
    authMiddleware2,
    requireRole([
      "Super Admin",
      "CRM/Admin Support",
      "Academic/Admin Coordinator",
      "Analytics & Reporting Admin",
      "Partnerships/Admin for B2B/B2G",
    ]),
    async (req, res) => {
      try {
        // 1. Fetch all users with completedBlogs
        const users = await User.find(
          {},
          { firstName: 1, lastName: 1, email: 1, createdAt: 1, completedBlogs: 1 }
        ).lean();

        // 2. Fetch quiz attempts
        const quizAttempts = await QuizAttempt.find({}).lean();

        // Create quiz map for efficiency
        const quizMap = {};
        quizAttempts.forEach((qa) => {
          const uid = qa.user?.toString();
          if (!uid) return;
          if (!quizMap[uid]) quizMap[uid] = [];
          quizMap[uid].push(qa);
        });

        // 3. Build leaderboard data
        const leaderboard = users.map((u) => {
          const uid = u._id.toString();
          const attempts = quizMap[uid] || [];
          const avgScore =
            attempts.length > 0
              ? attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length
              : 0;

          const passedQuizzes = attempts.filter((a) => a.score >= 50).length; // Pass mark = 50%
          const blogsCompleted = u.completedBlogs?.length || 0; // ✅ use user's completedBlogs

          let score = avgScore * 5 + blogsCompleted * 8 + passedQuizzes * 2;
          if (avgScore >= 85) score += 10; // Bonus

          return {
            userId: uid,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            avgScore: Math.round(avgScore * 10) / 10,
            blogsCompleted,
            passedQuizzes,
            score,
            dateJoined: u.createdAt,
          };
        });

        // 4. Sort and rank
        const sorted = leaderboard.sort((a, b) => b.score - a.score).slice(0, 20);
        const ranked = sorted.map((s, i) => ({ rank: i + 1, ...s }));

        res.json({ leaderboard: ranked });
      } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
      }
    }
  );

  router.get('/drop-off-tracking', authMiddleware2, requireRole([
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Analytics & Reporting Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
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

      const inactive14 = []; // 14–30 days
      const inactive30 = []; // 30+ days

      for (const user of users) {
        const lastActivity = getLastActivity(user);

        if (!lastActivity || lastActivity < oneMonthAgo) {
          // 30+ days
          inactive30.push({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            cohort: user.cohortApplied || 'Unassigned',
            lastActivity,
            reason: user.inactiveReason || 'No reason provided'
          });
        } else if (lastActivity < twoWeeksAgo) {
          // strictly between 14 and 30 days
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
        // detailed: [...inactive30, ...inactive14]
      });
    } catch (err) {
      console.error('Drop-off tracking error:', err);
      res.status(500).json({ error: 'Failed to fetch drop-off data' });
    }
  });

  // 🟡 Admins only: Update user in both DBs
  router.put('/users/:id', authMiddleware2, requireRole([
    'Analytics & Reporting Admin',
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Community Manager',
    'Developer/System Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
    try {
      let { gender } = req.body;

      if (gender) {
        gender = gender.toLowerCase();
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        { ...req.body, gender },
        { new: true }
      );

      res.json(updatedStudent);
    } catch (err) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  router.delete('/users/:id', authMiddleware2, requireRole([
    'Analytics & Reporting Admin',
    'Super Admin',
    'CRM/Admin Support',
    'Academic/Admin Coordinator',
    'Community Manager',
    'Developer/System Admin',
    'Partnerships/Admin for B2B/B2G'
  ]), async (req, res) => {
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
