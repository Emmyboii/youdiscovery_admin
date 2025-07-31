// models/DailyEmailQuota.js
import mongoose from 'mongoose';

const DailyEmailQuotaSchema = new mongoose.Schema({
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true,
    unique: true,
  },
  sentCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('DailyEmailQuota', DailyEmailQuotaSchema);
