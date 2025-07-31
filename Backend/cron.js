// cron.js
import cron from 'node-cron';
import User from './Models/userModel.js';
import { sendAnnouncementToAll } from './utils/mailer.js'; // Your updated function
import dotenv from 'dotenv';
dotenv.config();

/**
 * ⏰ CRON: Runs every day at 9:00 AM server time
 */
cron.schedule('0 9 * * *', async () => {
  console.log('🕘 Cron started: checking for unfinished announcements...');

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all logs from today that still have remaining users
    const logs = await AnnouncementLog.find({
      date: today,
      remaining: { $exists: true, $not: { $size: 0 } }
    });

    if (!logs.length) {
      console.log('✅ No pending announcements today.');
      return;
    }

    for (const log of logs) {
      const users = await User.find({ email: { $in: log.remaining } }, 'email firstName');
      if (!users.length) continue;

      await sendAnnouncementToAll(users, log.subject, '(original message reused)');
    }
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});
