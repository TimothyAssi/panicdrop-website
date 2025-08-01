# Switch to Real Google Authentication

## 🚀 Quick Setup for Real Google Sign-In

### Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Project name: `panicdrop-auth` (or any name you like)
4. Enable Google Analytics: **Optional**
5. Click **"Create project"**

### Step 2: Enable Google Authentication (2 minutes)

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Add your domain: `panicdrop.com`
5. Save

### Step 3: Get Your Config (1 minute)

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** section
3. Click the **Web** icon `</>`
4. App name: `panicdrop-tools`
5. Copy the `firebaseConfig` object

### Step 4: Update Config File (30 seconds)

Edit `/js/firebase-config-real.js` and replace this section:

```javascript
// REPLACE THIS with your actual config:
const firebaseConfig = {
    apiKey: "your-actual-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

### Step 5: Switch to Real Auth (1 minute)

**Update these 4 files** by changing this line:

```html
<!-- CHANGE THIS: -->
<script type="module" src="../js/firebase-config-demo.js"></script>

<!-- TO THIS: -->
<script type="module" src="../js/firebase-config-real.js"></script>
```

**Files to update:**
- `altcoin-toolkit/position-calculator.html`
- `altcoin-toolkit/screenshot-analyzer.html`
- `altcoin-toolkit/altcoin-scanner-fixed.html`
- `altcoin-toolkit/trader-journal.html`

### Step 6: Create Firestore Database (2 minutes)

1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in production mode"**
3. Select location (choose closest to your users)

### Step 7: Add Yourself as Member (1 minute)

1. In Firestore, create collection: `members`
2. Add document with **your email as document ID**:

```json
Document ID: "youremail@gmail.com"
{
  "email": "youremail@gmail.com",
  "isMember": true
}
```

## ✅ Test Real Authentication

1. **Clear browser cache/cookies**
2. **Go to any tool page**
3. **Click "Sign in to unlock"**
4. **Click Google Sign-In**
5. **Sign in with your Google account**
6. **Tools should unlock if you added your email as member!**

---

## 🔄 Quick Switch Back to Demo

If you need to go back to demo mode, just change the script tags back:

```html
<script type="module" src="../js/firebase-config-demo.js"></script>
```

---

## 🎯 What You'll See

**With Real Auth:**
- Google popup appears
- You sign in with your actual Google account
- Shows "Welcome, Your Name (Member)" if you're in members collection
- Tools unlock for real members only

**Benefits:**
- ✅ Real Google authentication 
- ✅ Your actual Google profile
- ✅ Secure member verification
- ✅ Ready for production use