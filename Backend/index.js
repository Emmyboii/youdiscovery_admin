// index.js
import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cron from 'node-cron';
import { exec } from 'child_process';

import authRoutes from './Routes/auth.js';
import createUserRoutes from './Routes/user.js';
import adminRoutes from './Routes/admin.js';
import adminEmailRoutes from './Routes/adminEmail.js';
import statsRoutes from './Routes/stats.js';
import groupRoutes from './Routes/groups.js';

config(); // Load .env

const app = express();
app.use(cors());
app.use(json());

// Routes that don't require async setup
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin', adminEmailRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => {
    res.send('Admin Approval Backend Running ✅');
});

// Cron job to send queued emails every day at 9AM
cron.schedule('0 9 * * *', () => {
    console.log('⏰ Running email sender cron at 9AM...');
    exec('node cron/sendQueuedAnnouncement.js', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Cron job error:', err);
        } else {
            console.log(stdout);
        }
    });
});

// Loose schema for syncing
const genericSchema = new mongoose.Schema({}, { strict: false });

async function startTwoWaySync() {
    try {
        const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI);
        const newConn = await mongoose.createConnection(process.env.NEW_DB_URI);

        console.log('✅ Connected to both old and new databases');

        const models = {
            User: 'users',
            Chapter: 'chapters',
            Blog: 'blogs',
            Quiz: 'quizzes',
            QuizAttempt: 'quizattempts',
            Group: 'groups',
        };

        const oldModels = {};
        const newModels = {};

        for (const [name, collection] of Object.entries(models)) {
            oldModels[name] = oldConn.models[name] || oldConn.model(name, genericSchema, collection);
            newModels[name] = newConn.models[name] || newConn.model(name, genericSchema, collection);
        }

        const syncChange = async (change, source, targetModel) => {
            const docId = change.documentKey._id;
            const docSource = change.fullDocument?._source;

            if (docSource === source) return;

            try {
                if (['insert', 'update', 'replace'].includes(change.operationType)) {
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

        // Sync all defined models: Old → New
        for (const [name] of Object.entries(models)) {
            oldModels[name].watch().on('change', (change) => syncChange(change, 'old', newModels[name]));
            // If needed: Uncomment for New → Old syncing
            // newModels[name].watch().on('change', (change) => syncChange(change, 'new', oldModels[name]));
        }

        console.log('🚀 Two-way sync initialized');
    } catch (err) {
        console.error('❌ Sync initialization error:', err.message);
    }
}

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.NEW_DB_URI)
    .then(async () => {
        const userRoutes = await createUserRoutes();
        app.use('/api', userRoutes);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        startTwoWaySync();
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
    });
