# Authentication Setup Guide

## 🚀 Current Status: DEMO MODE

Your authentication system is currently running in **DEMO MODE** which simulates the login process without requiring Firebase setup.

### Demo Login Credentials

**These emails will unlock tools in demo mode:**
- `member@example.com` (any password 6+ chars)
- `test@panicdrop.com` (any password 6+ chars) 
- `demo@member.com` (any password 6+ chars)

**Any other email will show as "Not a member"**

---

## 🔧 Switch to Production Firebase

To enable real Firebase authentication:

### 1. Set up Firebase (follow firebase-setup-instructions.md)

### 2. Update Firebase Config
Edit `js/firebase-config.js` with your actual Firebase credentials

### 3. Switch to Production
In each tool file, change:
```html
<!-- FROM: -->
<script type="module" src="../js/firebase-config-demo.js"></script>

<!-- TO: -->
<script type="module" src="../js/firebase-config.js"></script>
```

**Files to update:**
- `altcoin-toolkit/position-calculator.html`
- `altcoin-toolkit/screenshot-analyzer.html`
- `altcoin-toolkit/altcoin-scanner-fixed.html`  
- `altcoin-toolkit/trader-journal.html`

### 4. Add Real Members
Add member emails to your Firestore `members` collection:
```json
{
  "email": "customer@domain.com",
  "isMember": true
}
```

---

## 🧪 Testing the Demo

1. **Open any tool page**
2. **Click "Sign in to unlock"**
3. **Try demo credentials:**
   - Email: `member@example.com`
   - Password: `password123`
4. **Tools should unlock!**

---

## 🐛 Troubleshooting

**If buttons don't work:**
1. Open browser F12 Developer Tools
2. Check Console for error messages
3. Look for "Demo:" prefixed logs
4. Ensure no JavaScript errors

**Common Issues:**
- Clear browser cache if authentication seems stuck
- Check that modal appears when clicking "Sign in to unlock"
- Verify console shows "Demo: PanicDropAuth initialized"