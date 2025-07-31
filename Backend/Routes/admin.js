// routes/admins.js
import { Router } from 'express';
import Admin from '../models/adminModel.js';
import { authMiddleware2, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware2, requireRole(['Master Admin']), async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});

router.get('/profile', authMiddleware2, async (req, res) => {
  const admin = await Admin.findById(req.user.id).select("-password");
  if (!admin) return res.status(404).json({ error: "Admin not found" });
  res.json(admin);
});

router.put('/:id', authMiddleware2, requireRole(['Master Admin']), async (req, res) => {
  const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', authMiddleware2, requireRole(['Master Admin']), async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default router;
