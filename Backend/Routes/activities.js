import { Router } from 'express';
import User from '../Models/userModel.js';
import mongoose from 'mongoose';
// import Blog from '../Models/blogModel.js';
// import Chapter from '../Models/chapterModel.js';
// import Group from '../Models/groupModel.js';

const router = Router();

const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }), 'blogs');
const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', new mongoose.Schema({}, { strict: false }), 'chapters');
const Group = mongoose.models.Group || mongoose.model('Group', new mongoose.Schema({}, { strict: false }), 'groups');


// ✅ Get last 6 completed classes timeline
router.get('/user/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const rawCompleted = user.completedBlogs || [];

    // Normalize: array of { blog: ObjectId, completedAt?: Date }
    const completed = rawCompleted
      .map(entry => {
        if (entry && typeof entry === 'object' && 'blog' in entry) {
          return { blog: entry.blog, completedAt: entry.completedAt };
        } else {
          return { blog: entry, completedAt: null };
        }
      })
      .slice(-6)
      .reverse(); // Show most recent first

    const blogIds = completed.map(c => c.blog);
    const blogs = await Blog.find({ _id: { $in: blogIds } }).lean();

    const chapterIds = blogs.map(b => b.chapter).filter(Boolean);
    const chapters = await Chapter.find({ _id: { $in: chapterIds } }).lean();

    const groupIds = chapters.map(ch => ch.group).filter(Boolean);
    const groups = await Group.find({ _id: { $in: groupIds } }).lean();

    // Build maps for faster lookup
    const blogMap = Object.fromEntries(blogs.map(b => [b._id.toString(), b]));
    const chapterMap = Object.fromEntries(chapters.map(ch => [ch._id.toString(), ch]));
    const groupMap = Object.fromEntries(groups.map(gr => [gr._id.toString(), gr]));

    const timeline = completed.map(entry => {
      const blog = blogMap[entry.blog?.toString()];
      const chapter = chapterMap[blog?.chapter?.toString()];
      const group = groupMap[chapter?.group?.toString()];

      return {
        blogId: blog?._id,
        blogTitle: blog?.title,
        chapterTitle: chapter?.title,
        courseNumber: blog?.courseNumber || group?.title || 'Unknown',
        completedAt: entry.completedAt || blog?.updatedAt || new Date()
      };
    }).filter(item => item.blogId); // Filter out failed lookups

    res.json({ timeline });
  } catch (err) {
    console.error('Error in timeline route:', err);
    res.status(500).json({ error: 'Failed to fetch timeline.' });
  }
});

export default router;
