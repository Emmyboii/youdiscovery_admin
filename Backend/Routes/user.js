// routes/users.js
import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../Models/userModel.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const userSchema = new mongoose.Schema({}, { strict: false });

const createUserRoutes = async () => {
  // Connect to the old DB for sync actions
  const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const OldUser = oldConn.model('User', userSchema, 'users');
  const router = Router();

  // 🟢 Public: Fetch all users (no auth)
  router.get('/', async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // 🟡 Admins only: Fetch users (with role protection)
  router.get('/users', authMiddleware, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      let query = {};
      if (req.user.role === 'Cohort Admin' && req.user.cohortAssigned) {
        query.cohortApplied = req.user.cohortAssigned;
      }
      const users = await User.find(query);
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // 🟡 Admins only: Update user in both DBs
  router.put('/users/:id', authMiddleware, requireRole(['Master Admin', 'Super Admin', 'Support Admin']), async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      await OldUser.findByIdAndUpdate(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  // 🔴 Master Admin only: Delete user from both DBs
  router.delete('/users/:id', authMiddleware, requireRole(['Master Admin', 'Super Admin']), async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      await OldUser.findByIdAndDelete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
};

export default createUserRoutes;
