// routes/users.js
import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../Models/userModel.js';
import { authMiddleware2, requireRole } from '../middleware/auth.js';


const createUserRoutes = async () => {
  
  const router = Router();

  //Get all users
  router.get('/', authMiddleware2, async (req, res) => {
    try {
      const users = await User.find({});
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  //Get each users
  router.get('/users/:id', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // 🟡 Admins only: Fetch users (with role protection)
  router.get('/users', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin', 'Cohort Admin']), async (req, res) => {
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
  router.put('/users/:id', authMiddleware2, requireRole(['Master Admin', 'Super Admin', 'Support Admin']), async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Update failed' });
    }
  });

  // 🔴 Master Admin only: Delete user from both DBs
  router.delete('/users/:id', authMiddleware2, requireRole(['Master Admin', 'Super Admin']), async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ error: 'Delete failed' });
    }
  });

  return router;
};

export default createUserRoutes;
