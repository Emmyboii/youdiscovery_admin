import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isApproved: { type: Boolean, default: false },
  role: {
    type: String,
    enum: [
      'Super Admin',
      'Analytics & Reporting Admin',
      'Academic/Admin Coordinator',
      'Community Manager',
      'CRM/Admin Support',
      'Partnerships/Admin for B2B/B2G',
      'Finance/Billing Admin',
      'Developer/System Admin'
    ]
  }
});

export default model('Admin', adminSchema);
