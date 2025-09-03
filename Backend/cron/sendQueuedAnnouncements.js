// cron/sendQueuedAnnouncement.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AnnouncementLog from '../models/AnnouncementLog.js';
import transporter from '../utils/mailer.js';

const DAILY_LIMIT = 500;
const BATCH_DELAY = 3000;

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processAnnouncements = async () => {
  const pendingLogs = await AnnouncementLog.find({
    status: { $in: ['pending', 'in_progress'] },
    $expr: { $lt: ['$sentCount', { $size: '$users' }] }
  }).sort({ createdAt: 1 }); // oldest first

  if (!pendingLogs.length) return console.log('📭 No pending announcements.');

  let totalSentToday = 0;

  for (const log of pendingLogs) {
    const { subject, message, users, sentCount, batchSize = 100 } = log;

    const remaining = users.slice(sentCount);
    const remainingToday = DAILY_LIMIT - totalSentToday;

    if (remainingToday <= 0) {
      console.log('🚫 Reached global 500-email limit. Pausing until tomorrow.');
      break;
    }

    const toSend = remaining.slice(0, remainingToday);
    log.status = 'in_progress';

    for (let i = 0; i < toSend.length; i += batchSize) {
      const batch = toSend.slice(i, i + batchSize);

      const tasks = batch.map(user => {
        const html = `
          <div style="font-family: Arial;">
            <h2>Hello ${user.firstName},</h2>
            <p>${message}</p>
            <p>The YOU Discovery Team</p>
          </div>
        `;

        return transporter.sendMail({
          from: `"YOU Discovery Tech" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject,
          html,
        }).catch(err => {
          console.error(`❌ Error sending to ${user.email}:`, err.message);
        });
      });

      await Promise.all(tasks);
      log.sentCount += batch.length;
      log.lastBatchSentAt = new Date();
      totalSentToday += batch.length;

      await log.save();
      console.log(`📤 Sent ${batch.length} from "${subject}". Total today: ${totalSentToday}`);
      await delay(BATCH_DELAY);

      if (totalSentToday >= DAILY_LIMIT) {
        console.log(`🚫 Limit hit mid-batch. Remaining logs paused until tomorrow.`);
        return;
      }
    }

    if (log.sentCount >= users.length) {
      log.status = 'sent';
      await log.save();
      console.log(`✅ Completed "${subject}" entirely.`);
    }
  }
};

const run = async () => {
  await connectDB();
  await processAnnouncements();
  mongoose.disconnect();
};

run();
