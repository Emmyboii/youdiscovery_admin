import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  phonenumber: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  resetCode: { type: Schema.Types.Mixed },
  hasSubmittedForm: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date,
  _source: { type: String, enum: ['old', 'new'], default: 'new' },
  cohortApplied: { type: String, default: null },
  dateOfBirth: { type: String, default: null },
  notes: { type: String, default: null },
});

export default model('User', userSchema);
