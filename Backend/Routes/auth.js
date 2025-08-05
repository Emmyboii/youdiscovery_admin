// routes/auth.js
import { Router } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import Admin from '../models/adminModel.js';
import { sendEmailToMasterAdmin, sendApprovalEmail } from '../utils/mailer.js';

const router = Router();

// Admin Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed });

    const approvalToken = jwt.sign(
      { userId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    await sendEmailToMasterAdmin(name, email, admin._id, approvalToken);

    res.status(200).json({ message: 'Signup request submitted. Awaiting approval. Check your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ error: 'Account with this email does not exsist' });

    if (!admin.isApproved)
      return res.status(403).json({ error: 'Your account is pending approval' });

    const isMatch = await compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/profile', async (req, res) => {
  const currentUser = await Admin.findOne({ _id: req.user.id });
  res.json(currentUser);
})

// Approve Admin
router.get('/approve/:userId', async (req, res) => {
  const { userId } = req.params;
  const { role, token, cohortAssigned } = req.query;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== userId) {
      return res.status(401).json({ error: 'Invalid approval token' });
    }

    const admin = await Admin.findById(userId);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    admin.isApproved = true;
    admin.role = role;

    // ✅ Save cohortAssigned only if the role is Cohort Admin
    if (role === 'Cohort Admin' && cohortAssigned) {
      admin.cohortAssigned = cohortAssigned;
    }

    await admin.save();

    await sendApprovalEmail(admin.email, admin.name, role);

    res.status(200).send(`<h2>✅ ${admin.name} has been approved as ${role}${cohortAssigned ? ` for Cohort ${cohortAssigned}` : ''}</h2>`);
  } catch (err) {
    console.error('Approval error:', err.message);
    res.status(400).send('<h2>❌ Approval link expired or invalid.</h2>');
  }
});


export default router;
