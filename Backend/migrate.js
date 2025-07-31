import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Generic loose schema to allow any document structure
const genericSchema = new mongoose.Schema({}, { strict: false });

// Utility to migrate any collection
const migrateCollection = async (oldConn, newConn, name) => {
  try {
    const OldModel = oldConn.model(name, genericSchema, name);
    const NewModel = newConn.model(name, genericSchema, name);

    const oldDocs = await OldModel.find({});
    const docsWithSource = oldDocs.map(doc => ({
      ...doc.toObject(),
      _source: 'old',
    }));

    if (docsWithSource.length) {
      await NewModel.insertMany(docsWithSource, { ordered: false });
      console.log(`✅ Migrated ${docsWithSource.length} documents from ${name}`);
    } else {
      console.log(`⚠️ No documents to migrate for ${name}`);
    }
  } catch (err) {
    console.error(`❌ Migration error in collection "${name}":`, err.message);
  }
};

(async () => {
  try {
    const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newConn = await mongoose.createConnection(process.env.NEW_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🚀 Connected to both databases');

    const collections = ['users', 'chapters', 'quizzes', 'blogs', 'groups', 'quizattempts'];

    for (const name of collections) {
      await migrateCollection(oldConn, newConn, name);
    }

    console.log('🎉 All collections migrated successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Migration setup failed:', err.message);
    process.exit(1);
  }
})();
