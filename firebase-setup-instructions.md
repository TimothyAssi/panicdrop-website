# Firebase Setup Instructions

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `panicdrop-members`
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
   - Add your domain: `panicdrop.com`
   - Add authorized domains if needed

## 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in production mode**
3. Select your preferred location

## 4. Set up Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Members collection - readable by authenticated users
    match /members/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
    }
  }
}
```

## 5. Add Members to Firestore

1. Go to **Firestore Database** > **Data**
2. Create collection: `members`
3. Add documents with email as document ID:

```json
Document ID: "student@example.com"
{
  "email": "student@example.com",
  "isMember": true
}
```

## 6. Get Firebase Configuration

1. Go to **Project Settings** > **General**
2. Scroll to **Your apps** section
3. Click **Web app** icon
4. Register app name: `panicdrop-tools`
5. Copy the Firebase config object

## 7. Update Firebase Config

Replace the config in `/js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## 8. Test the System

1. Open any tool page
2. Tools should be blurred and locked
3. Click "Sign in to unlock"
4. Sign in with a member email
5. Tools should unlock automatically

## 9. Adding New Members

To add new course purchasers as members:

1. Go to Firestore Database
2. Add new document in `members` collection
3. Document ID = their email address
4. Set `isMember: true`

The authentication system will automatically check membership when users sign in.