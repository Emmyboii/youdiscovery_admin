import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, lowercase: true, trim: true, required: true },
  password: String,
  role: { type: String, default: 'user', lowercase: true },
  phonenumber: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  image: { type: String, default: null },
  createdAt: Date,
  updatedAt: Date,
  resetCode: {
    data: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    },
  },
  activationToken: { type: String, default: null },
  activationTokenCreatedAt: { type: Date, default: null },
  hasSubmittedForm: { type: Boolean, default: false },
  cohortApplied: { type: String, default: null },
  dateOfBirth: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  notes: { type: String, default: null },
  country: { type: String, default: null },
  state: { type: String, default: null },
  city: { type: String, default: null },
  inactiveReason: { type: String, default: null },
  certificatesEarned: { type: String, default: null },
  gender: { type: String, enum: ['male', 'female'] },
  quizAttempts: [
    { type: Schema.Types.ObjectId, ref: 'QuizAttempt' }
  ],
  completedBlogs: [
    {
      blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
      completedAt: { type: Date, default: Date.now }
    }
  ],
  _source: { type: String, enum: ['old', 'new'], default: 'new' },
}, { timestamps: true });

export default model('User', userSchema);
