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
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

export const sendEmailToMasterAdmin = async (name, email, userId, token) => {
  const roles = [
    'Super Admin',
    'Analytics & Reporting Admin',
    'Academic/Admin Coordinator',
    'Community Manager',
    'CRM/Admin Support',
    'Partnerships/Admin for B2B/B2G',
    'Finance/Billing Admin',
    'Developer/System Admin'
  ];

  const buttons = roles.map(role => {
    const link = `${backendUrl}/api/auth/redirect/approve/${userId}/${encodeURIComponent(role)}/${token}`;
    return `<a href="${link}" style="display:inline-block;margin:8px 0;padding:10px 20px;background-color:#1a73e8;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;">Approve as ${role}</a>`;
  }).join('<br><br>');

  const cohortInstructions = `
    <p><strong>To approve as a <i>Partnerships/Admin for B2B/B2G</i> with a cohort assigned:</strong></p>
    <p>Copy and Replace <code>COHORT_NUMBER</code> in the sample link below with the assigned cohort number:</p>
    <p style="font-family: monospace; background: #f4f4f4; padding: 8px;">
      ${backendUrl}/api/auth/approve/${userId}?role=Partnerships%2FAdmin%20for%20B2B%2FB2G&cohortAssigned=COHORT_NUMBER&token=${token}
    </p>
  `;

  const html = `
    <h2>New Admin Signup Request</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>Please choose a role to approve this user:</p>
    ${buttons}
    <br><br>
    ${cohortInstructions}
    <hr>
    <p style="font-size: 14px;"><strong>Role Descriptions:</strong></p>
    <ul>
      <li><strong>Super Admin</strong>: Full access to all modules and settings, including admin management, billing, and platform configs.</li>
      <li><strong>Analytics & Reporting Admin</strong>: Access to metrics, reports, student feedback, and performance tracking.</li>
      <li><strong>Academic/Admin Coordinator</strong>: Oversees completions, certifications, and test/quiz tracking.</li>
      <li><strong>Community Manager</strong>: Manages community engagement, discussions, announcements, and support chats.</li>
      <li><strong>CRM/Admin Support</strong>: Handles user complaints, tickets, FAQs, and account issues.</li>
      <li><strong>Partnerships/Admin for B2B/B2G</strong>: Manages partner institutions, staff enrollments, and client reporting. <strong>(Requires assigned cohort)</strong></li>
      <li><strong>Finance/Billing Admin</strong>: Oversees invoices, subscriptions, discounts, and payouts.</li>
      <li><strong>Developer/System Admin</strong>: Responsible for backend performance, error logs, integrations, and security.</li>
    </ul>
  `;

  await transporter.sendMail({
    from: fromDisplay,
    to: masterAdminEmail,
    subject: 'New Admin Signup Request',
    html,
  });

  console.log(`✅ Approval email sent to Super Admin for ${email}`);
};

export const sendApprovalEmail = async (email, name, role) => {
  const descriptions = {
    'Super Admin': 'Full access to all modules and settings. Can manage admins, billing, analytics, and platform configurations.',
    'Analytics & Reporting Admin': 'Access to user metrics, performance tracking, certificate reports, and KPIs.',
    'Academic/Admin Coordinator': 'Oversees course completions, quiz/test results, certifications, and attendance (if integrated).',
    'Community Manager': 'Manages forums, WhatsApp groups, announcements, and user engagement activities.',
    'CRM/Admin Support': 'Handles user support tickets, account resets, complaints, and support analytics.',
    'Partnerships/Admin for B2B/B2G': 'Manages partner institutions, enrollment stats, contracts, and organizational reporting.',
    'Finance/Billing Admin': 'Oversees billing, subscriptions, scholarships, payouts, and financial dashboards.',
    'Developer/System Admin': 'Handles backend systems, error logs, API integrations, security, and server performance.'
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
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; line-height: 1.6; color: #333;">
    <p>Hi <strong>${firstName}</strong>,</p>
    <p>From all of us at <strong>YOU Discovery</strong>, we’re celebrating <strong>YOU</strong> today! 🥳</p>
    <p>Your journey of growth and reinvention inspires us, and we’re honored to walk alongside <strong>YOU</strong>!</p>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">🎁 Your Birthday Gift:</h3>
      <p style="margin: 0;">For the next 24 hours, you have the opportunity to ask <strong>YOU Discovery</strong> for your next leap — whether it’s a:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Job</li>
        <li>Internship</li>
        <li>Mentorship</li>
        <li>Volunteering Experience</li>
        <li>To be Featured on our Platform(s)</li>
        <li>Free Access to a Book</li>
        <li>Scholarship to take a Course</li>
      </ul>
      <p style="margin: 0;">It’s your special day, make the most of it and ask boldly! 🌟</p>
    </div>

    <p>May this new year bring you fresh opportunities, bold leaps, and even greater victories.</p>
    <p>Keep shining, keep growing, and keep discovering the best version of <strong>YOU</strong>.</p>

    <p style="font-size: 14px; color: #777; margin-top: 30px;">
      With love,<br/>
      💙 The YOU Discovery Team
    </p>
  </div>
`;


  await transporter.sendMail({
    from: `"YouDiscovery 🎓" <${fromEmail}>`,
    to: email,
    subject: '🎂✨ Happy Birthday YOU Discoverer! ✨🎂',
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
          <p style="font-size: 14px; color: #777;">— The YOU Discovery Team</p>
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
