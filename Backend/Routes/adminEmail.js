// routes/adminEmail.js
import { Router } from 'express';
import { authMiddleware2, requireRole } from '../middleware/auth.js';
import User from '../Models/userModel.js';
import { sendAnnouncementEmail } from '../utils/mailer.js';

const router = Router();

// 🔐 Master + Super Admins can send mass emails
router.post('/send-email', authMiddleware2, requireRole(['Master Admin', 'Super Admin']), async (req, res) => {
  const { subject, message, filter } = req.body;

  try {
    const { minCompletedClasses, cohortApplied, isActiveOnly } = filter || {};

    const matchStage = {};
    if (cohortApplied) matchStage.cohortApplied = cohortApplied;
    if (isActiveOnly) matchStage.isActive = true;

    const pipeline = [
      { $addFields: { completedCount: { $size: { $ifNull: ['$completedBlogs', []] } } } },
      { $match: matchStage }
    ];

    if (minCompletedClasses) {
      pipeline.push({ $match: { completedCount: { $gte: Number(minCompletedClasses) } } });
    }

    pipeline.push({ $project: { email: 1, firstName: 1 } });

    const users = await User.aggregate(pipeline);

    if (!users.length) {
      return res.status(404).json({ error: 'No users matched the criteria.' });
    }

    for (const user of users) {
      await sendAnnouncementEmail(user.email, user.firstName, subject, message);
    }

    res.json({ message: `✅ Emails sent to ${users.length} users.` });
  } catch (err) {
    console.error('Mass email error:', err.message);
    res.status(500).json({ error: 'Failed to send announcement.' });
  }
});


router.post('/email-count', authMiddleware2, requireRole(['Master Admin', 'Super Admin']), async (req, res) => {
  try {
    const { minCompletedClasses, cohortApplied, isActiveOnly } = req.body;

    const matchStage = {};

    if (cohortApplied) matchStage.cohortApplied = cohortApplied;
    if (isActiveOnly) matchStage.isActive = true;

    const pipeline = [
      { $addFields: { completedCount: { $size: { $ifNull: ['$completedBlogs', []] } } } },
      { $match: matchStage }
    ];

    if (minCompletedClasses) {
      pipeline.push({ $match: { completedCount: { $gte: Number(minCompletedClasses) } } });
    }

    const countResult = await User.aggregate([
      ...pipeline,
      { $count: 'total' }
    ]);

    const count = countResult[0]?.total || 0;
    res.json({ count });
  } catch (err) {
    console.error('Error counting users:', err);
    res.status(500).json({ error: 'Failed to count users.' });
  }
});



export default router;
