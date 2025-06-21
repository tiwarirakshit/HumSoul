# Google Auth Setup Guide for HumSoul

## Issues Fixed

The following issues have been resolved in your Google Auth setup:

1. **Mismatched Firebase Projects**: Updated `firebase.ts` to use the correct `humsoul-spare` project
2. **Missing OAuth Client Configuration**: Added proper OAuth client configuration in `google-services.json`
3. **Incorrect Redirect Scheme**: Fixed the OAuth redirect scheme in `AndroidManifest.xml`
4. **Enhanced Error Handling**: Added better debugging and error handling throughout the auth flow

## Required Google Cloud Console Configuration

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `humsoul-spare` project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your authorized domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your `humsoul-spare` project
3. Navigate to **APIs & Services** → **Credentials**
4. Create or update OAuth 2.0 Client IDs:

#### Android Client ID
- **Application type**: Android
- **Package name**: `com.humsoul.app`
- **SHA-1 certificate fingerprint**: Get this from your keystore

#### Web Client ID
- **Application type**: Web application
- **Authorized JavaScript origins**:
  - `http://localhost:3000` (for development)
  - `https://your-domain.com` (for production)
- **Authorized redirect URIs**:
  - `http://localhost:3000` (for development)
  - `https://your-domain.com` (for production)

### 3. Get SHA-1 Certificate Fingerprint

Run this command to get your debug SHA-1:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

For release builds, use your release keystore:

```bash
keytool -list -v -keystore android/app/humsoul-release.keystore -alias humsoul-key -storepass humsoul -keypass humsoul
```

## Files Updated

### 1. `android/app/google-services.json`
- Added OAuth client configuration
- Updated to include proper client IDs

### 2. `android/app/src/main/AndroidManifest.xml`
- Fixed OAuth redirect scheme to match client ID

### 3. `client/src/lib/firebase.ts`
- Updated Firebase configuration to use `humsoul-spare` project
- Enhanced error handling and debugging

### 4. `client/src/lib/capacitor.ts`
- Improved Capacitor Google Auth initialization
- Added error handling

### 5. `client/src/components/auth/splash-screen.tsx`
- Enhanced error handling for better user feedback

## Testing the Setup

1. **Clean and rebuild your Android app**:
   ```bash
   npm run cap:sync
   npx cap build android
   ```

2. **Test on device/emulator**:
   - The app should now properly handle Google Sign-In
   - Check console logs for debugging information
   - If issues persist, the error messages will be more descriptive

## Common Issues and Solutions

### Issue: "Google sign-in failed: No idToken returned"
- **Solution**: Ensure OAuth client is properly configured in Google Cloud Console
- **Solution**: Verify SHA-1 fingerprint is correct

### Issue: "auth/configuration-not-found"
- **Solution**: Enable Google Sign-In in Firebase Console
- **Solution**: Add your domain to authorized domains

### Issue: "auth/popup-closed-by-user"
- **Solution**: User closed the sign-in popup - this is normal behavior
- **Solution**: Ensure popups are allowed in browser settings

### Issue: "auth/network-request-failed"
- **Solution**: Check internet connection
- **Solution**: Verify Firebase project configuration

## Debugging

The app now includes comprehensive logging. Check the browser/device console for:
- Capacitor plugin initialization status
- Google Sign-In attempt details
- Firebase authentication flow
- Error details with codes and messages

## Next Steps

1. Test the Google Sign-In flow on both Android and web
2. Verify that users can successfully authenticate
3. Check that the auth state is properly managed
4. Test the sign-out functionality

If you continue to experience issues, the enhanced error handling will provide more specific information about what's going wrong. 