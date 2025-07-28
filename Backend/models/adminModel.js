import { Schema, model } from 'mongoose';

const adminSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isApproved: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['Master Admin', 'Super Admin', 'Support Admin', 'Mini Admin', 'Cohort Admin']
  },
  cohortAssigned: { type: String, default: null } // e.g., "Cohort 2"
});


export default model('Admin', adminSchema);  // Connects to NEW_DB `admins` collection
