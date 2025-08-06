import { Router } from 'express';
import { authMiddleware2, requireRole } from '../middleware/auth.js';
import User from '../Models/userModel.js';
import dotenv from 'dotenv';
import AnnouncementLog from '../models/AnnouncementLog.js';
import { sendFirstBatchImmediately } from '../utils/sendNow.js';

dotenv.config();

const router = Router();
const fromEmail = process.env.EMAIL_USER;

// 🔐 Master + Super Admins can send announcements
router.post(
  '/send-email',
  authMiddleware2,
  requireRole(['Super Admin', 'Community Manager', 'CRM/Admin Support',]),
  async (req, res) => {
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

      const log = await AnnouncementLog.create({
        subject,
        message,
        users,
        sentCount: 0,
        status: 'pending',
      });

      // ✅ Send first 500 immediately:
      await sendFirstBatchImmediately(log);

      res.json({
        message: `📬 Emails sent successfully`,
        total: users.length,
      });
    } catch (err) {
      console.error('Mass email error:', err.message);
      res.status(500).json({ error: 'Failed to send announcement.' });
    }
  }
);

// 🔍 Preview count before sending
router.post(
  '/email-count',
  authMiddleware2,
  requireRole(['Super Admin', 'Community Manager', 'CRM/Admin Support',]),
  async (req, res) => {
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

      const countResult = await User.aggregate([...pipeline, { $count: 'total' }]);
      const count = countResult[0]?.total || 0;

      res.json({ count });
    } catch (err) {
      console.error('Error counting users:', err);
      res.status(500).json({ error: 'Failed to count users.' });
    }
  }
);

export default router;
