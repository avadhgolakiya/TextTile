import { getCollection } from '../db.js';
import { ObjectId } from 'mongodb';

export async function logActivity(req, action, details) {
  try {
    if (!req.userId) return; // Need user context

    const usersColl = getCollection('users');
    const userDoc = await usersColl.findOne({ _id: new ObjectId(req.userId) });

    if (!userDoc || !userDoc.isAdmin) return; // Only log admin activity

    const activityColl = getCollection('activity_logs');
    await activityColl.insertOne({
      adminId: req.userId,
      adminName: userDoc.name || 'Admin',
      adminEmail: userDoc.email,
      action,
      details,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
