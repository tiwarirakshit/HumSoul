import { Router } from 'express';
import { db } from '../db';
import { fcmTokens, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import admin from 'firebase-admin';

const router = Router();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Save FCM token
router.post('/token', async (req, res) => {
  try {
    const { token, deviceType, userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    if (!token || !deviceType) {
      return res.status(400).json({ error: 'Token and device type are required' });
    }

    // Check if token already exists
    const existingToken = await db
      .select()
      .from(fcmTokens)
      .where(eq(fcmTokens.token, token))
      .limit(1);

    if (existingToken.length > 0) {
      // Update existing token
      await db
        .update(fcmTokens)
        .set({
          userId,
          deviceType,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(fcmTokens.token, token));
    } else {
      // Insert new token
      await db.insert(fcmTokens).values({
        userId,
        token,
        deviceType,
        isActive: true,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove FCM token
router.delete('/token', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    await db
      .update(fcmTokens)
      .set({ isActive: false })
      .where(eq(fcmTokens.userId, parseInt(userId as string)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send notification to specific user
router.post('/send/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, body, data, adminUserId } = req.body;

    // Check if requester is admin
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, adminUserId))
      .limit(1);

    if (!adminUser.length || adminUser[0].username !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get user's FCM tokens
    const userTokens = await db
      .select()
      .from(fcmTokens)
      .where(and(eq(fcmTokens.userId, parseInt(userId)), eq(fcmTokens.isActive, true)));

    if (userTokens.length === 0) {
      return res.status(404).json({ error: 'No active FCM tokens found for user' });
    }

    // Send notification to all user's devices
    const messages = userTokens.map((tokenRecord) => ({
      token: tokenRecord.token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'humsoul-notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    }));

    const results = await Promise.allSettled(
      messages.map((message) => admin.messaging().send(message))
    );

    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      sent: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send notification to all users
router.post('/send-all', async (req, res) => {
  try {
    const { title, body, data, adminUserId } = req.body;

    // Check if requester is admin
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.id, adminUserId))
      .limit(1);

    if (!adminUser.length || adminUser[0].username !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get all active FCM tokens
    const allTokens = await db
      .select()
      .from(fcmTokens)
      .where(eq(fcmTokens.isActive, true));

    if (allTokens.length === 0) {
      return res.status(404).json({ error: 'No active FCM tokens found' });
    }

    // Send notification to all devices
    const messages = allTokens.map((tokenRecord) => ({
      token: tokenRecord.token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'humsoul-notifications',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    }));

    const results = await Promise.allSettled(
      messages.map((message) => admin.messaging().send(message))
    );

    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      sent: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error('Error sending notification to all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 