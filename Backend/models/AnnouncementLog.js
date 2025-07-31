import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    sent: { type: Boolean, default: false }, // ✅ important for progress tracking
});

const announcementLogSchema = new mongoose.Schema({
    subject: String,
    message: String,
    users: [userSchema],  // All recipients with `sent` status
    sentCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'sent', 'error'],
        default: 'pending'
    },
    batchSize: { type: Number, default: 100 },
    lastBatchSentAt: Date,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AnnouncementLog', announcementLogSchema);
