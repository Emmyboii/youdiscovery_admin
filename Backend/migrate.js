// migrate.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });

(async () => {
  try {
    const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const newConn = await mongoose.createConnection(process.env.NEW_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const OldUser = oldConn.model('User', userSchema, 'users');
    const NewUser = newConn.model('User', userSchema, 'users');

    const oldUsers = await OldUser.find({});

    const newData = oldUsers.map(user => ({
      ...user.toObject(),
      _source: 'old'
    }));

    await NewUser.insertMany(newData);
    console.log('✅ One-time migration complete');

    process.exit();
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
})();