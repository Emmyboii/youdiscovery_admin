import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false means STARTTLS, not SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true
});

// Send email to Master Admin with approval buttons (manual cohort support)
export const sendEmailToMasterAdmin = async (name, email, userId, token) => {
  const backendUrl = process.env.BACKEND_URL;

  const roles = ['Master Admin', 'Super Admin', 'Support Admin', 'Mini Admin', 'Cohort Admin'];

  const isCohortAdminIncluded = roles.includes('Cohort Admin');

  const buttons = roles.map(role => {
    const link = `${backendUrl}/api/auth/approve/${userId}?role=${encodeURIComponent(role)}&token=${token}`;
    return `
      <a href="${link}" style="
        display:inline-block;
        margin:8px 0;
        padding:10px 20px;
        background-color:#1a73e8;
        color:#fff;
        text-decoration:none;
        border-radius:5px;
        font-weight:bold;
      ">Approve as ${role}</a>
    `;
  }).join('<br>');

  const cohortInstructions = `
  <p><strong>To approve as a Cohort Admin:</strong></p>
  <p>Copy and paste this link into your browser. Replace <code>COHORT_NUMBER</code> with the actual cohort number (e.g. <em>7</em>):</p>
  <p style="font-family: monospace; background: #f4f4f4; padding: 8px; word-break: break-all;">
    ${backendUrl}/api/auth/approve/${userId}?role=Cohort%20Admin&cohortAssigned=COHORT_NUMBER&token=${token}
  </p>
`;

  const html = `
  <h2>New Admin Signup Request</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p>Please choose a role to approve this user:</p>
  ${buttons}
  <br><br>
  ${isCohortAdminIncluded ? cohortInstructions : ''}
  <br><hr>
  <p style="font-size: 14px;"><strong>Role Descriptions:</strong></p>
  <ul>
    <li><strong>Master Admin</strong>: Full control over system and admins.</li>
    <li><strong>Super Admin</strong>: Can manage users and settings.</li>
    <li><strong>Support Admin</strong>: Handles user issues and reports.</li>
    <li><strong>Mini Admin</strong>: Limited access to specific tools.</li>
    <li><strong>Cohort Admin</strong>: Can only manage users of their assigned cohort.</li>
  </ul>
`;

  await transporter.sendMail({
    from: `"Admin System" <${process.env.EMAIL_USER}>`,
    to: process.env.MASTER_ADMIN_EMAIL,
    subject: 'New Admin Signup Request',
    html,
  });
  console.log(`✅ Email sent to ${email}`);
};

// Send confirmation email to approved user
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
    <p>Your admin request has been approved. You have been assigned the role of <strong>${role}</strong>.</p>
    <br>
    <h3>Admin Roles Overview:</h3>
    <ul>
      ${Object.entries(descriptions).map(([r, d]) => `<li><strong>${r}</strong>: ${d}</li>`).join('')}
    </ul>
    <br>
    <p>You can now log in and access the admin dashboard.</p>
  `;

  await transporter.sendMail({
    from: `"Admin System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Admin Access Has Been Approved',
    html,
  });
  console.log(`✅ Email sent to ${email}`);
};

// Send birthday email to user
export const sendBirthdayEmail = async (email, firstName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #1a73e8;">🎉 Happy Birthday, ${firstName}!</h2>
      <p style="font-size: 16px; color: #333;">
        All of us at <strong>YouDiscovery</strong> wish you a day filled with joy, success, and great memories.
      </p>
      <p style="font-size: 16px; color: #333;">
        Keep learning, keep growing. We're glad you're part of the community!
      </p>
      <div style="margin-top: 20px;">
        <img src="https://media.giphy.com/media/xUPGcEliCc7bETyfO8/giphy.gif" alt="Birthday" style="width: 100%; max-width: 400px; border-radius: 10px;" />
      </div>
      <br>
      <p style="font-size: 14px; color: #777;">
        — The YouDiscovery Team
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"YouDiscovery 🎓" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Happy Birthday from YouDiscovery!',
    html,
  });
  console.log(`✅ Email sent to ${email}`);
};

export const sendAnnouncementEmail = async (email, firstName, subject, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Hello ${firstName},</h2>
      <p style="font-size: 16px; color: #333;">${message}</p>
      <br>
      <p style="font-size: 14px; color: #777;">— The YouDiscovery Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"YouDiscovery Announcements" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

