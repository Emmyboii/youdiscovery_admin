// mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import AnnouncementLog from '../models/AnnouncementLog.js';

const backendUrl = process.env.BACKEND_URL;
const fromEmail = process.env.EMAIL_USER;
const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
const fromName = 'YouDiscovery Admin System';
const fromDisplay = `"${fromName}" <${fromEmail}>`;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: false,
});

export const sendEmailToMasterAdmin = async (name, email, userId, token) => {
  const roles = ['Master Admin', 'Super Admin', 'Support Admin', 'Mini Admin', 'Cohort Admin'];

  const buttons = roles.map(role => {
    const link = `${backendUrl}/api/auth/approve/${userId}?role=${encodeURIComponent(role)}&token=${token}`;
    return `<a href="${link}" style="display:inline-block;margin:8px 0;padding:10px 20px;background-color:#1a73e8;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">Approve as ${role}</a>`;
  }).join('<br>');

  const cohortInstructions = `
    <p><strong>To approve as a Cohort Admin:</strong></p>
    <p>Replace <code>COHORT_NUMBER</code> with the cohort number:</p>
    <p style="font-family: monospace; background: #f4f4f4; padding: 8px;">
      ${backendUrl}/api/auth/approve/${userId}?role=Cohort%20Admin&cohortAssigned=COHORT_NUMBER&token=${token}
    </p>
  `;

  const html = `
    <h2>New Admin Signup Request</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>Please choose a role to approve this user:</p>
    ${buttons}<br><br>${cohortInstructions}<hr>
    <p style="font-size: 14px;"><strong>Role Descriptions:</strong></p>
    <ul>
      <li><strong>Master Admin</strong>: Full control over system and admins.</li>
      <li><strong>Super Admin</strong>: Can manage users and settings.</li>
      <li><strong>Support Admin</strong>: Handles user issues and reports.</li>
      <li><strong>Mini Admin</strong>: Limited access to specific tools.</li>
      <li><strong>Cohort Admin</strong>: Only manages users of assigned cohort.</li>
    </ul>
  `;

  await transporter.sendMail({
    from: fromDisplay,
    to: masterAdminEmail,
    subject: 'New Admin Signup Request',
    html,
  });

  console.log(`✅ Approval email sent to Master Admin for ${email}`);
};

export const sendApprovalEmail = async (email, name, role) => {
  const descriptions = {
    'Master Admin': 'Full access including system control and user management.',
    'Super Admin': 'Can manage users and admins except Master Admins.',
    'Support Admin': 'Handles user issues and support tasks.',
    'Mini Admin': 'View-only access',
    'Cohort Admin': 'Access only to users of their assigned cohort.'
  };

  const html = `
    <h2>Congratulations, ${name}!</h2>
    <p>You’ve been approved as <strong>${role}</strong>.</p>
    <h3>Admin Role Descriptions:</h3>
    <ul>
      ${Object.entries(descriptions).map(([r, d]) => `<li><strong>${r}</strong>: ${d}</li>`).join('')}
    </ul>
    <p>You can now access your admin dashboard.</p>
  `;

  await transporter.sendMail({
    from: fromDisplay,
    to: email,
    subject: '✅ Admin Access Approved',
    html,
  });

  console.log(`✅ Approval confirmation sent to ${email}`);
};

export const sendBirthdayEmail = async (email, firstName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #1a73e8;">🎉 Happy Birthday, ${firstName}!</h2>
      <p>All of us at <strong>YouDiscovery</strong> wish you a joyful, successful, and memorable day.</p>
      <img src="https://media.giphy.com/media/xUPGcEliCc7bETyfO8/giphy.gif" alt="Birthday" style="max-width: 400px; border-radius: 10px;" />
      <p style="font-size: 14px; color: #777;">— The YouDiscovery Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"YouDiscovery 🎓" <${fromEmail}>`,
    to: email,
    subject: '🎉 Happy Birthday from YouDiscovery!',
    html,
  });

  console.log(`✅ Birthday email sent to ${email}`);
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const sendAnnouncementToAll = async (users, subject, message, batchSize = 100) => {
  const today = new Date().toISOString().split('T')[0];
  const maxToday = 500;

  let sentCount = 0;
  const unsent = [];

  for (let i = 0; i < users.length && sentCount < maxToday; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const allowedBatch = batch.slice(0, maxToday - sentCount);

    const tasks = allowedBatch.map(user => {
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${user.firstName},</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          <p style="font-size: 14px; color: #777;">— The YouDiscovery Team</p>
        </div>
      `;

      return transporter.sendMail({
        from: `"YouDiscovery Announcements" <${fromEmail}>`,
        to: user.email,
        subject,
        html,
      }).then(() => {
        sentCount++;
      }).catch(err => {
        console.error(`❌ Error sending to ${user.email}:`, err);
        unsent.push(user);
      });
    });

    await Promise.all(tasks);
    await delay(3000);
  }

  const notProcessed = users.slice(sentCount);
  const totalUnsent = [...unsent, ...notProcessed];

  if (totalUnsent.length) {
    await AnnouncementLog.findOneAndUpdate(
      { date: today, subject },
      {
        subject,
        message,
        remaining: totalUnsent,
        date: today,
        status: 'pending',
      },
      { upsert: true, new: true }
    );
    console.log(`⏳ Saved ${totalUnsent.length} unsent emails to resume tomorrow.`);
  } else {
    console.log(`✅ All ${sentCount} emails sent today with no remaining.`);
  }
};

export default transporter;
