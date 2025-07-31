// routes/groups.js
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

const groupSchema = new mongoose.Schema({}, { strict: false });
const Group = mongoose.models.Group || mongoose.model('Group', groupSchema, 'groups');

// Get all groups (courses)
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({});
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

export default router;
