// routes/admins.js
import { Router } from 'express';
import Admin from '../models/adminModel.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, requireRole(['Master Admin']), async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});

router.put('/:id', authMiddleware, requireRole(['Master Admin']), async (req, res) => {
  const updated = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', authMiddleware, requireRole(['Master Admin']), async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default router;
