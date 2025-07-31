// utils/sendNow.js
import transporter from './mailer.js';
// import AnnouncementLog from '../models/AnnouncementLog.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const sendFirstBatchImmediately = async (log) => {
  const DAILY_LIMIT = 500;
  const BATCH_DELAY = 3000;
  const { users, sentCount, subject, message, batchSize } = log;

  const remaining = users.slice(sentCount);
  const toSend = remaining.slice(0, DAILY_LIMIT);

  for (let i = 0; i < toSend.length; i += batchSize) {
    const batch = toSend.slice(i, i + batchSize);

    const tasks = batch.map(user => {
      const html = `
        <div style="font-family: Arial;">
          <h2>Hello ${user.firstName},</h2>
          <p>${message}</p>
          <p>— The YouDiscovery Team</p>
        </div>
      `;

      return transporter.sendMail({
        from: `"YouDiscovery Announcements" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html,
      });
    });

    await Promise.all(tasks);
    log.sentCount += batch.length;
    log.lastBatchSentAt = new Date();
    log.status = 'in_progress';
    await log.save();
    console.log(`✅ Immediately sent batch of ${batch.length}`);
    await delay(BATCH_DELAY);
  }

  if (log.sentCount >= users.length) {
    log.status = 'sent';
    await log.save();
  }
};
