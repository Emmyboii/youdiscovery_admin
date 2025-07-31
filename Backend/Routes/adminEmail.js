import { Router } from 'express';
import { authMiddleware2, requireRole } from '../middleware/auth.js';
import User from '../Models/userModel.js';
// import { sendAnnouncementToAll } from '../utils/mailer.js'; // or import from your `mailer.js` if that’s where transporter is
import dotenv from 'dotenv';
import AnnouncementLog from '../models/AnnouncementLog.js';
import { sendFirstBatchImmediately } from '../utils/sendNow.js'; // You will create this next

dotenv.config();

const router = Router();
const fromEmail = process.env.EMAIL_USER;

// Delay helper
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Batch announcement sender (parallel per batch)
// const sendAnnouncementToAll = async (users, subject, message, batchSize = 100) => {
//   for (let i = 0; i < users.length; i += batchSize) {
//     const batch = users.slice(i, i + batchSize);

//     const tasks = batch.map(user => {
//       const html = `
//         <div style="font-family: Arial, sans-serif; padding: 20px;">
//           <h2>Hello ${user.firstName},</h2>
//           <p style="font-size: 16px; color: #333;">${message}</p>
//           <p style="font-size: 14px; color: #777;">— The YouDiscovery Team</p>
//         </div>
//       `;

//       return transporter.sendMail({
//         from: `"YouDiscovery Announcements" <${fromEmail}>`,
//         to: user.email,
//         subject,
//         html,
//       });
//     });

//     try {
//       await Promise.all(tasks); // Parallel send
//       console.log(`📢 Sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(users.length / batchSize)}`);
//     } catch (error) {
//       console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
//     }

//     await delay(3000); // Wait before next batch
//   }
// };

// 🔐 Master + Super Admins can send announcements
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
});

// 🔍 Preview count before sending
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

    const countResult = await User.aggregate([...pipeline, { $count: 'total' }]);
    const count = countResult[0]?.total || 0;

    res.json({ count });
  } catch (err) {
    console.error('Error counting users:', err);
    res.status(500).json({ error: 'Failed to count users.' });
  }
});

export default router;
