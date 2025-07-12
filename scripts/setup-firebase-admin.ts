import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up Firebase Admin SDK for Push Notifications');
console.log('');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  fs.writeFileSync(envPath, '');
}

// Read current .env content
let envContent = '';
if (envExists) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check if Firebase Admin variables are already set
const hasFirebaseAdmin = envContent.includes('FIREBASE_PROJECT_ID') || 
                        envContent.includes('FIREBASE_CLIENT_EMAIL') || 
                        envContent.includes('FIREBASE_PRIVATE_KEY');

if (hasFirebaseAdmin) {
  console.log('✅ Firebase Admin SDK variables already found in .env');
  console.log('');
  console.log('Current Firebase Admin variables:');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('FIREBASE_')) {
      console.log(`  ${line.split('=')[0]}=***`);
    }
  });
} else {
  console.log('❌ Firebase Admin SDK variables not found in .env');
  console.log('');
  console.log('To enable push notifications, you need to:');
  console.log('');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project (humsoul-27d0f)');
  console.log('3. Go to Project Settings > Service Accounts');
  console.log('4. Click "Generate new private key"');
  console.log('5. Download the JSON file');
  console.log('6. Add the following variables to your .env file:');
  console.log('');
  console.log('   FIREBASE_PROJECT_ID=your-project-id');
  console.log('   FIREBASE_CLIENT_EMAIL=your-service-account-email');
  console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"');
  console.log('');
  console.log('⚠️  Important: The FIREBASE_PRIVATE_KEY should be the entire private key including the BEGIN and END markers');
  console.log('');
}

console.log('📱 For mobile push notifications, you also need to:');
console.log('');
console.log('1. Add your iOS/Android apps to Firebase project');
console.log('2. Download google-services.json for Android');
console.log('3. Download GoogleService-Info.plist for iOS');
console.log('4. Place them in the respective platform folders');
console.log('');
console.log('🔗 For detailed setup instructions, see:');
console.log('   https://firebase.google.com/docs/cloud-messaging/js/client');
console.log('   https://capacitorjs.com/docs/guides/push-notifications'); 