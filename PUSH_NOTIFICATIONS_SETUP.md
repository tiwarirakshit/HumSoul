# Push Notifications Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) push notifications for your HumSoul app.

## Prerequisites

- Firebase project (already configured: `humsoul-27d0f`)
- Capacitor project with iOS and Android platforms
- Node.js and npm

## Step 1: Install Dependencies

The required dependencies have already been installed:

```bash
npm install @capacitor/push-notifications firebase-admin
```

## Step 2: Firebase Admin SDK Setup

Run the setup script to check your Firebase Admin configuration:

```bash
npm run setup:firebase
```

### Manual Setup (if needed):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`humsoul-27d0f`)
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Add the following variables to your `.env` file:

```env
FIREBASE_PROJECT_ID=humsoul-27d0f
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@humsoul-27d0f.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Important**: The `FIREBASE_PRIVATE_KEY` should be the entire private key including the BEGIN and END markers.

## Step 3: Mobile Platform Setup

### Android Setup

1. Go to Firebase Console > Project Settings > General
2. Add Android app if not already added:
   - Package name: `com.humsoul.app`
   - App nickname: `HumSoul Android`
3. Download `google-services.json`
4. Place it in the `android/app/` directory
5. Build and run the app

### iOS Setup

1. Go to Firebase Console > Project Settings > General
2. Add iOS app if not already added:
   - Bundle ID: `com.humsoul.app`
   - App nickname: `HumSoul iOS`
3. Download `GoogleService-Info.plist`
4. Place it in the `ios/App/App/` directory
5. Open Xcode and add the file to your project
6. Build and run the app

## Step 4: Database Migration

The FCM tokens table has been added to the database schema. Run the migration:

```bash
npm run db:push
```

## Step 5: Testing Push Notifications

### Using the Admin Panel

1. Start your development server: `npm run dev`
2. Navigate to `/admin/notifications`
3. Send a test notification to all users or a specific user

### Using the API Directly

```bash
# Send to all users
curl -X POST http://localhost:3000/api/push-notifications/send-all \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification",
    "adminUserId": 1
  }'

# Send to specific user
curl -X POST http://localhost:3000/api/push-notifications/send/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Personal Notification",
    "body": "This is a personal notification",
    "adminUserId": 1
  }'
```

## Step 6: Notification Actions

The app supports deep linking when users tap on notifications:

- **Playlist notifications**: Opens the specified playlist
- **Category notifications**: Opens the discover page with the specified category
- **General notifications**: Opens the app normally

## Implementation Details

### Client-Side

- **Push Notification Service**: `client/src/lib/push-notifications.ts`
- **React Hook**: `client/src/hooks/use-push-notifications.ts`
- **Admin Interface**: `client/src/pages/admin/notifications.tsx`

### Server-Side

- **API Routes**: `server/routes/push-notifications.ts`
- **Database Schema**: `shared/schema.ts` (fcm_tokens table)

### Key Features

1. **Automatic Token Management**: FCM tokens are automatically saved when users open the app
2. **Multi-Device Support**: Users can receive notifications on multiple devices
3. **Admin Controls**: Send notifications to all users or specific users
4. **Deep Linking**: Notifications can open specific playlists or categories
5. **Platform Support**: Works on both iOS and Android

## Troubleshooting

### Common Issues

1. **"Push notifications are only available on native platforms"**
   - This is expected on web browsers. Test on mobile devices or simulators.

2. **"Firebase Admin SDK not initialized"**
   - Check your `.env` file has the correct Firebase Admin credentials.

3. **"No active FCM tokens found"**
   - Users need to open the app at least once to register their FCM tokens.

4. **Notifications not appearing on iOS**
   - Ensure you have the correct provisioning profile and push notification capability enabled in Xcode.

### Debug Commands

```bash
# Check Firebase Admin setup
npm run setup:firebase

# View database tokens
# Connect to your database and run:
# SELECT * FROM fcm_tokens WHERE is_active = true;
```

## Security Considerations

1. **Admin Access**: Only admin users can send notifications
2. **Token Validation**: FCM tokens are validated before sending
3. **User Privacy**: Users can disable notifications in their device settings

## Next Steps

1. **Scheduled Notifications**: Implement daily motivation notifications
2. **User Preferences**: Allow users to choose notification types
3. **Analytics**: Track notification engagement
4. **A/B Testing**: Test different notification content

## Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/guides/push-notifications)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) 