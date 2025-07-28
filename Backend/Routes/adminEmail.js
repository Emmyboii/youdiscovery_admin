// routes/adminEmail.js
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import User from '../Models/userModel.js';
import { sendAnnouncementEmail } from '../utils/mailer.js';

const router = Router();

// 🔐 Master + Super Admins can send mass emails
router.post('/send-email', authMiddleware, requireRole(['Master Admin', 'Super Admin']), async (req, res) => {
  const { subject, message, filter } = req.body;

  try {
    let query = {};

    // 🧠 Optional filters
    if (filter?.minCompletedClasses) {
      query['completedClasses'] = { $gte: filter.minCompletedClasses };
    }

    if (filter?.cohortApplied) {
      query['cohortApplied'] = filter.cohortApplied;
    }

    if (filter?.isActiveOnly) {
      query['isActive'] = true;
    }

    const users = await User.find(query, 'email firstName');

    if (!users.length) {
      return res.status(404).json({ error: 'No users matched the criteria.' });
    }

    // Send emails in batches (optional)
    for (const user of users) {
      await sendAnnouncementEmail(user.email, user.firstName, subject, message);
    }

    res.json({ message: `✅ Emails sent to ${users.length} users.` });
  } catch (err) {
    console.error('Mass email error:', err.message);
    res.status(500).json({ error: 'Failed to send announcement.' });
  }
});

export default router;
