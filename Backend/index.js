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
import activiesRoutes from './Routes/activities.js';
import groupRoutes from './Routes/groups.js';

config(); // Load .env

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://youdiscovery-admin.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(json());

// Routes that don't require async setup
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin', adminEmailRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/activities', activiesRoutes);
app.use('/api/groups', groupRoutes);

app.get('/', (req, res) => {
    res.send('Admin Approval Backend Running ✅');
});

// Cron job to send queued emails every day at 9AM
cron.schedule('0 7 * * *', () => {
    console.log('⏰ Running email sender cron at 7AM...');
    exec('node cron/sendQueuedAnnouncement.js', (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Cron job error:', err);
        } else {
            console.log(stdout);
        }
    });
});

// Loose schema for syncing
// Loose schema for syncing
const genericSchema = new mongoose.Schema({}, { strict: false });

async function startOneWaySync() {
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

        // Backfill function (Old → New)
        const backfillCollection = async (modelName) => {
            const oldDocs = await oldModels[modelName].find({});
            console.log(`📦 Found ${oldDocs.length} ${modelName} docs in Old DB`);

            for (const doc of oldDocs) {
                await newModels[modelName].findByIdAndUpdate(
                    doc._id,
                    { ...doc.toObject(), _source: 'old' },
                    { upsert: true }
                );
            }

            console.log(`✅ Backfilled ${oldDocs.length} ${modelName} docs to New DB`);
        };

        // Sync function (real-time changes Old → New)
        const syncChange = async (change, targetModel) => {
            const docId = change.documentKey._id;
            const docSource = change.fullDocument?._source;

            // Skip if change already came from Old DB
            if (docSource === 'old') return;

            try {
                if (['insert', 'update', 'replace'].includes(change.operationType)) {
                    await targetModel.findByIdAndUpdate(
                        docId,
                        { ...change.fullDocument, _source: 'old' },
                        { upsert: true, new: true }
                    );
                } else if (change.operationType === 'delete') {
                    await targetModel.findByIdAndDelete(docId);
                }

                console.log(`🔁 ${change.operationType.toUpperCase()} synced from Old → New`);
            } catch (err) {
                console.error(`❌ Sync error:`, err.message);
            }
        };

        // Run initial backfill for each collection
        for (const [name] of Object.entries(models)) {
            await backfillCollection(name);

            // Start watching for changes
            oldModels[name].watch().on('change', (change) =>
                syncChange(change, newModels[name])
            );
        }

        console.log('🚀 One-way sync (Old → New) initialized');
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

        startOneWaySync();
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
    });
