import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js'; // Adjust path as needed

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.isApproved) return res.status(403).json({ error: 'Access denied' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authMiddleware2 = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.userId);  // Changed from User to Admin
    if (!admin || !admin.isApproved) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.user = admin; // Attach admin to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient privileges' });
  }
  next();
};