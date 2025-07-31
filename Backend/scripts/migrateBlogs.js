import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const genericSchema = new mongoose.Schema({}, { strict: false });

const migrateBlogs = async () => {
  try {
    // Connect to old and new databases
    const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newConn = await mongoose.createConnection(process.env.NEW_DB_URI || process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const OldBlog = oldConn.model('Group', genericSchema, 'groups');
    const NewBlog = newConn.model('Group', genericSchema, 'groups');

    console.log('🚀 Connected to both databases');

    const oldBlogs = await OldBlog.find({});
    console.log(`📦 Found ${oldBlogs.length} groups(s) in old DB`);

    let copiedCount = 0;
    for (const blog of oldBlogs) {
      const exists = await NewBlog.findById(blog._id);
      if (!exists) {
        await NewBlog.create({ ...blog.toObject(), _source: 'old' });
        copiedCount++;
        console.log(`✅ Copied blog: ${blog._id}`);
      }
    }

    console.log(`🎉 Migration complete. Total copied: ${copiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
};

migrateBlogs();
