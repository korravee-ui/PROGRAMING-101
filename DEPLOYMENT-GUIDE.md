# 🚀 IHC-BD&PD Dashboard — Deployment Guide (Online)

This guide will help you deploy your dashboard online with Firebase authentication and real-time database.

---

## 📋 Prerequisites

- A GitHub account (free at github.com)
- A Firebase account (free at firebase.google.com)
- A Vercel or Netlify account (free at vercel.com or netlify.com)
- Git installed on your computer (optional but recommended)

---

## Phase 1: Set Up Firebase (5-10 minutes)

### Step 1.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: `ihc-dashboard` (or any name you prefer)
4. **Uncheck** "Enable Google Analytics" (not needed for MVP)
5. Click **"Create project"** and wait for completion
6. Click **"Continue"** when finished

### Step 1.2: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Under "Sign-in method," click **Email/Password**
4. Toggle **Enable** and click **"Save"**
5. Go to **Users** tab and click **"Add user"**
   - Email: `demo@example.com`
   - Password: `Demo123456`
   - Click **"Add user"**

### Step 1.3: Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose region: **asia-southeast1** (Singapore - closest to Thailand) or your preferred region
5. Click **"Enable"**

### Step 1.4: Set Up Security Rules

**⚠️ IMPORTANT:** Configure Firestore security rules to require authentication.

1. In Firestore, go to **Rules** tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all access
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Step 1.5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in top-left)
2. Scroll down to **"Your apps"** section
3. Click on **Web app** icon (</> symbol)
4. If no app exists yet, click **"Add app"** → **Web**
5. Register app with name: `ihc-dashboard-web`
6. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Phase 2: Update Firebase Credentials in Your Project

### Step 2.1: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Locate the `firebaseConfig` object at the top
3. Replace the values with your Firebase credentials from Step 1.5
4. **Save** the file

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1234567890abcdefghijklmnopqrstu",
  authDomain: "ihc-dashboard-abc123.firebaseapp.com",
  projectId: "ihc-dashboard-abc123",
  storageBucket: "ihc-dashboard-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

---

## Phase 3: Deploy to Vercel (5 minutes)

### Step 3.1: Push Code to GitHub

1. Install Git (if not already installed): https://git-scm.com/download/win
2. Open Terminal/PowerShell in your project folder
3. Initialize Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: IHC Dashboard with Firebase"
   ```

4. Create a GitHub repository:
   - Go to https://github.com/new
   - Repository name: `ihc-dashboard`
   - Select **Private** (to keep your data safe)
   - Click **"Create repository"**

5. Add GitHub remote and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ihc-dashboard.git
   git branch -M main
   git push -u origin main
   ```

   (When prompted, use your GitHub Personal Access Token: Settings → Developer settings → Personal access tokens)

### Step 3.2: Deploy via Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **"Sign up"** and choose **"Continue with GitHub"**
3. Click **"New Project"**
4. Select your `ihc-dashboard` repository
5. Configure:
   - **Framework**: Select **"Other"** (since these are static HTML files)
   - **Build Command**: Leave blank (or set to `echo "No build needed"`)
   - **Output Directory**: **.** (current folder)
6. Click **"Deploy"**
7. Wait for deployment to complete (usually 1-2 minutes)
8. You'll get a URL like: `https://ihc-dashboard.vercel.app`

### Step 3.3: Add Environment Variables (Optional - for advanced setup)

If using environment variables:
1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add your Firebase credentials (if using env vars)
3. Redeploy

---

## Phase 4: Configure Firebase for Your Domain

### Step 4.1: Add Vercel Domain to Firebase Authorized Domains

1. Go to Firebase Console → **Settings** → **Authentication** → **Authorized domains**
2. Click **"Add domain"**
3. Enter: `ihc-dashboard.vercel.app` (or your custom domain)
4. Click **"Add"**

---

## Phase 5: Test Your Online Dashboard

### Step 5.1: Access Your Dashboard

1. Go to: `https://ihc-dashboard.vercel.app`
2. You should see the **Login/Sign-up** page

### Step 5.2: Test Login

1. Click **"เข้าสู่ระบบ"** (Login tab)
2. Enter:
   - Email: `demo@example.com`
   - Password: `Demo123456`
3. Click **"เข้าสู่ระบบ"** (Sign In)
4. ✓ You should be redirected to the dashboard

### Step 5.3: Test Creating Customer Record

1. Click **"+ เพิ่มลูกค้า"** (Add Customer)
2. Fill in a test customer record
3. Click **"บันทึก"** (Save)
4. You should see a success message: **✓ บันทึกเรียบร้อย**
5. Go to **Firebase Console** → **Firestore** → Your user's collection to verify data was saved

### Step 5.4: Test Real-time Sync

1. Open another browser tab with your dashboard
2. Add another customer in the first tab
3. Refresh the second tab
4. ✓ New customer should appear (real-time sync is working)

---

## Phase 6: Custom Domain (Optional)

If you have a custom domain (e.g., `dashboard.mycompany.com`):

### Step 6.1: Add Domain to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain
4. Configure DNS records (Vercel will show you how)
5. Wait for DNS propagation (5-30 minutes)

### Step 6.2: Add Custom Domain to Firebase

1. Firebase Console → **Settings** → **Authentication** → **Authorized domains**
2. Add your custom domain (e.g., `dashboard.mycompany.com`)

---

## Phase 7: Import Existing Data (Optional)

If you have customer data in Excel/CSV format:

1. Prepare your data in Excel with these columns:
   - name, company, phone, email, projectName, status, etc.
   - Save as `.xlsx` or `.csv`

2. Go to your online dashboard → **+ เพิ่มลูกค้า** (Add Customer)
3. Click **"นำเข้าจากไฟล์"** (Import from file)
4. Select your Excel file
5. Review the preview and click **"ยืนยันการนำเข้า"** (Confirm Import)
6. ✓ Data will be saved to Firebase automatically

---

## 📝 Post-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Authentication enabled with Email/Password
- [ ] Firestore database created with security rules
- [ ] Code pushed to GitHub
- [ ] Project deployed to Vercel
- [ ] Domain added to Firebase authorized domains
- [ ] Login tested with demo credentials
- [ ] Can create and save customer records
- [ ] Real-time sync verified
- [ ] Data visible in Firebase Firestore console

---

## 🆘 Troubleshooting

### "Not authenticated, redirecting to login"
- **Cause**: User not logged in
- **Fix**: Make sure you've logged in via auth.html first

### "Error saving to Firebase"
- **Cause**: Firebase config missing or incorrect
- **Fix**: Check firebase-config.js has correct credentials

### "auth/invalid-api-key"
- **Cause**: Firebase API key is incorrect
- **Fix**: Verify credentials from Firebase Console → Project Settings

### "Firestore permissions denied"
- **Cause**: Security rules not set up
- **Fix**: Update Firestore rules to allow authenticated users (see Phase 1.4)

### "Domain not authorized"
- **Cause**: Your vercel domain not in Firebase authorized domains
- **Fix**: Add it in Firebase Console → Authentication → Authorized domains

---

## 🚀 Next Steps (Future Enhancements)

1. **Google Sign-In**: Allow users to sign in with Google
2. **Data Export**: Add export to Excel functionality
3. **User Roles**: Admin, Manager, Viewer roles with different permissions
4. **Custom Reports**: Generate monthly reports
5. **Mobile App**: React Native or Flutter mobile version
6. **API Backend**: Node.js/Express for advanced features

---

## 📞 Support

For issues:
1. Check browser Console (F12 → Console tab) for error messages
2. Review Firebase Console Logs
3. Check Vercel deployment logs
4. Verify all credentials are correct

---

**Congratulations! 🎉 Your IHC Dashboard is now live online!**

Share the URL with your team. Each user can sign up with their own email or use the demo credentials.

---

*Last updated: 2026-06-23*
*Firebase SDK: v9.23.0*
