// index.js
import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './Routes/auth.js';
import createUserRoutes from './Routes/user.js';
import connectDB from './config/db.js';
import adminRoutes from './Routes/admin.js';
import adminEmailRoutes from './Routes/adminEmail.js';

config(); // Load .env

const app = express();
app.use(cors());
app.use(json());
connectDB();
// Routes
app.use('/api/auth', authRoutes);

(async () => {
    const userRoutes = await createUserRoutes();
    app.use('/api', userRoutes);
})();

app.use('/api/admins', adminRoutes);

app.use('/api/admin', adminEmailRoutes);

app.get('/', (req, res) => {
    res.send('Admin Approval Backend Running ✅');
});

// User Schema (loose for sync)
const userSchema = new mongoose.Schema({}, { strict: false });

async function startTwoWaySync() {
    try {
        const oldConn = await mongoose.createConnection(process.env.OLD_DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const newConn = await mongoose.createConnection(process.env.NEW_DB_URI || process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to both old and new databases');

        const OldUser = oldConn.model('User', userSchema, 'users');
        const NewUser = newConn.model('User', userSchema, 'users');

        const syncChange = async (change, source, targetModel) => {
            const docId = change.documentKey._id;
            const docSource = change.fullDocument?._source;

            if (docSource === source) return; // prevent loop

            try {
                if (change.operationType === 'insert') {
                    await targetModel.create({ ...change.fullDocument, _source: source });
                } else if (['update', 'replace'].includes(change.operationType)) {
                    const updatedDoc = await targetModel.findByIdAndUpdate(
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
        NewUser.watch().on('change', (change) => syncChange(change, 'new', OldUser));

        console.log('🚀 Two-way sync running...');
    } catch (err) {
        console.error('❌ Sync initialization error:', err.message);
    }
}

// Start sync after server starts
startTwoWaySync();

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
    });
