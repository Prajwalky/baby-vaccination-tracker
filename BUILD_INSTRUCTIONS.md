# 📱 Build Your Baby Vaccination Tracker APK

## Complete Step-by-Step Guide to Get the App on Your Phone

Your app is 100% ready! Follow these instructions to build and install the Android APK.

---

## 🎯 Quick Summary
- **Time needed**: 15-20 minutes
- **What you'll get**: Installable APK file
- **Requirements**: Computer with Node.js installed

---

## 📋 Prerequisites

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Version 18 or higher recommended

2. **Install Git** (if not already installed)
   - Download from: https://git-scm.com/

---

## 🚀 Method 1: Build Using EAS (Recommended - Easiest)

### Step 1: Download Your Project

**Option A: Use Emergent's Download Feature**
- Click "Download Code" or "Export" button in Emergent dashboard

**Option B: Clone via Git** (if available)
```bash
git clone [YOUR_PROJECT_URL]
cd baby-vaccination-tracker
```

### Step 2: Install Dependencies

Open terminal/command prompt in the project folder:

```bash
cd frontend
npm install -g eas-cli
npm install
```

### Step 3: Login to Expo

```bash
eas login
```

- Create a free Expo account if you don't have one
- Follow the prompts to log in

### Step 4: Configure the Build

```bash
eas build:configure
```

- Select "Android" when prompted
- This will use the existing `eas.json` configuration

### Step 5: Build the APK

```bash
eas build --platform android --profile preview
```

- This builds an APK (not AAB)
- Build happens in the cloud (free for personal use)
- Takes 10-15 minutes
- You'll get a download link when done

### Step 6: Download and Install

1. **Download the APK** from the link provided by EAS
2. **Transfer to your phone** via:
   - Email the link to yourself
   - Use Google Drive/Dropbox
   - Direct download on phone's browser
3. **Install on Android**:
   - Open the APK file
   - Allow "Install from Unknown Sources" if prompted
   - Tap "Install"

---

## 🏠 Method 2: Build Locally (Advanced)

If you want to build on your own computer without cloud services:

### Prerequisites
- Android Studio installed
- Android SDK configured
- Java JDK installed

### Steps

```bash
cd frontend

# Install dependencies
npm install

# Build APK locally
npx expo run:android --variant release

# Or use direct build
eas build --platform android --local
```

The APK will be in: `android/app/build/outputs/apk/release/`

---

## 📱 Installation on Your Phone

### Android Installation Steps:

1. **Enable Installation from Unknown Sources**:
   - Go to: Settings → Security → Unknown Sources
   - OR: Settings → Apps → Special Access → Install Unknown Apps
   - Enable for your browser/file manager

2. **Install the APK**:
   - Download the APK to your phone
   - Open the file from Downloads folder
   - Tap "Install"
   - Wait for installation to complete

3. **Grant Permissions**:
   - When you first open the app, it will ask for:
     - Camera access (for baby photos)
     - Storage access (for photo gallery)
     - Notification access (for vaccination reminders)
   - Grant all permissions for full functionality

---

## 🔧 Backend Connection

**IMPORTANT**: Your app needs to connect to the backend server!

### Option A: Backend is Already Deployed (Current Setup)

The app is pre-configured to use:
```
https://baby-care-compass.preview.emergentagent.com/api/
```

✅ This should work as long as the Emergent server is running!

### Option B: Deploy Your Own Backend (For Long-term Use)

If you want the app to work permanently, you should deploy the backend to:
- **Railway.app** (easiest, free tier available)
- **Render.com** (free tier available)
- **Heroku** (paid)
- **Your own VPS**

Then update the backend URL in `/frontend/services/api.ts`

---

## ✅ Verification

After installation, test these features:

1. **Open the app** - Should show "Create Baby Profile" screen
2. **Add baby profile** with photo
3. **View vaccinations** - Should show 31 vaccinations
4. **Mark one as complete** - Should work and save
5. **Check notifications** - Grant permission when asked

---

## 🆘 Troubleshooting

### "Build failed" error
- Make sure you're logged into EAS: `eas login`
- Check internet connection
- Try: `eas build --clear-cache`

### "Can't install APK" on phone
- Enable "Unknown Sources" in Android settings
- Make sure it's an APK file (not AAB)
- Try downloading again

### "App can't connect to backend"
- Check if backend URL is accessible: Open `https://baby-care-compass.preview.emergentagent.com/api/` in browser
- If not working, backend needs to be redeployed
- Contact support or redeploy backend separately

### "Notifications not working"
- Make sure you granted notification permission
- Check phone's notification settings
- Notifications work on real devices, not simulators

---

## 📞 Need Help?

If you get stuck:

1. **Check EAS Build docs**: https://docs.expo.dev/build/setup/
2. **Expo Forum**: https://forums.expo.dev/
3. **Your backend is already live** at the preview URL above
4. **Contact Emergent support** if backend issues persist

---

## 🎉 You're All Set!

Once installed, you can:
- ✅ Add your baby's information
- ✅ Track all vaccinations from birth to 2 years
- ✅ Get reminders 1 week & 1 day before due dates
- ✅ Mark vaccinations as complete
- ✅ Add notes for each vaccination

**Enjoy tracking your baby's health! 👶💉**
