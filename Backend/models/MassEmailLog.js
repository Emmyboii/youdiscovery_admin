// models/MassEmailLog.js
import mongoose from 'mongoose';

const MassEmailLogSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true },
  recipients: [{ email: String, firstName: String }],
  subject: String,
  message: String,
  sentCount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  lastSentAt: { type: Date },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('MassEmailLog', MassEmailLogSchema);
