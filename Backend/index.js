// index.js
import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './Routes/auth.js';
import createUserRoutes from './Routes/user.js';
// import connectDB from './config/db.js';
import adminRoutes from './Routes/admin.js';
import adminEmailRoutes from './Routes/adminEmail.js';
import statsRoutes from './Routes/stats.js';
import groupRoutes from './Routes/groups.js';

config(); // Load .env

const app = express();
app.use(cors());
app.use(json());
// connectDB();
// Routes
app.use('/api/auth', authRoutes);

(async () => {
    const userRoutes = await createUserRoutes();
    app.use('/api', userRoutes);
})();

app.use('/api/admins', adminRoutes);

app.use('/api/admin', adminEmailRoutes);

app.use('/api/stats', statsRoutes);

app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => {
    res.send('Admin Approval Backend Running ✅');
});

// User Schema (loose for sync)
const genericSchema = new mongoose.Schema({}, { strict: false });

async function startTwoWaySync() {
    try {
        const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI);

        const newConn = await mongoose.createConnection(process.env.NEW_DB_URI);


        console.log('✅ Connected to both old and new databases');

        const OldUser = oldConn.models.User || oldConn.model('User', genericSchema, 'users');
        const NewUser = newConn.models.User || newConn.model('User', genericSchema, 'users');

        const OldChapter = oldConn.models.Chapter || oldConn.model('Chapter', genericSchema, 'chapters');
        const NewChapter = newConn.models.Chapter || newConn.model('Chapter', genericSchema, 'chapters');

        const OldClasses = oldConn.models.Blog || oldConn.model('Blog', genericSchema, 'blogs');
        const NewClasses = newConn.models.Blog || newConn.model('Blog', genericSchema, 'blogs');

        const OldQuiz = oldConn.models.Quiz || oldConn.model('Quiz', genericSchema, 'quizzes');
        const NewQuiz = newConn.models.Quiz || newConn.model('Quiz', genericSchema, 'quizzes');

        const OldQuizAttempt = oldConn.models.QuizAttempt || oldConn.model('QuizAttempt', genericSchema, 'quizattempts');
        const NewQuizAttempt = newConn.models.QuizAttempt || newConn.model('QuizAttempt', genericSchema, 'quizattempts');

        const OldGroup = oldConn.models.Group || oldConn.model('Group', genericSchema, 'groups');
        const NewGroup = newConn.models.Group || newConn.model('Group', genericSchema, 'groups');


        const syncChange = async (change, source, targetModel) => {
            const docId = change.documentKey._id;
            const docSource = change.fullDocument?._source;

            if (docSource === source) return; // prevent loop

            try {
                if (change.operationType === 'insert') {
                    await targetModel.findByIdAndUpdate(
                        docId,
                        { ...change.fullDocument, _source: source },
                        { upsert: true, new: true }
                    );
                } else if (['update', 'replace'].includes(change.operationType)) {
                    await targetModel.findByIdAndUpdate(
                        docId,
                        { ...change.fullDocument, _source: source },
                        { upsert: true, new: true }
                    );
                } else if (change.operationType === 'delete') {
                    await targetModel.findByIdAndDelete(docId);
                }

                console.log(`🔁 ${change.operationType.toUpperCase()} synced from ${source}`);
            } catch (err) {
                console.error(`❌ Sync error from ${source}:`, err.message);
            }
        };

        // One-way: old → new
        OldUser.watch().on('change', (change) => syncChange(change, 'old', NewUser));
        // One-way: new → old
        // NewUser.watch().on('change', (change) => syncChange(change, 'new', OldUser));

        OldChapter.watch().on('change', (change) => syncChange(change, 'old', NewChapter));
        // NewChapter.watch().on('change', (change) => syncChange(change, 'new', OldChapter));

        // OldCourse.watch().on('change', (change) => syncChange(change, 'old', NewCourse));
        // NewCourse.watch().on('change', (change) => syncChange(change, 'new', OldCourse));

        OldClasses.watch().on('change', (change) => syncChange(change, 'old', NewClasses));
        // NewClasses.watch().on('change', (change) => syncChange(change, 'new', OldClasses));

        OldQuiz.watch().on('change', (change) => syncChange(change, 'old', NewQuiz));
        // NewQuiz.watch().on('change', (change) => syncChange(change, 'new', OldQuiz));

        OldGroup.watch().on('change', (change) => syncChange(change, 'old', NewGroup));
        // NewGroup.watch().on('change', (change) => syncChange(change, 'new', OldGroup));

        OldQuizAttempt.watch().on('change', (change) => syncChange(change, 'old', NewQuizAttempt));
        // NewQuizAttempt.watch().on('change', (change) => syncChange(change, 'new', OldQuizAttempt));


        console.log('🚀 Two-way sync running...');
    } catch (err) {
        console.error('❌ Sync initialization error:', err.message);
    }
}

// Start sync after server starts
startTwoWaySync();

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.NEW_DB_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
    });
