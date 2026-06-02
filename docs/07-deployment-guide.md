# Scratch — Deployment Guide (Phase 7)
**Version:** 1.0 | **Date:** 2026-05-31

---

## Step 1 — Create Expo Account (Free)

1. Go to https://expo.dev
2. Click "Sign up" — it's free
3. In your terminal: `eas login`

---

## Step 2 — Configure EAS Build

```bash
cd scratch
eas build:configure
```

This creates the `eas.json` file (already included in the project).

---

## Step 3 — Build Preview APK (Android)

```bash
eas build --platform android --profile preview
```

- Builds in the cloud — no need for Android Studio
- Takes ~10–15 minutes first time
- You get a download link for the `.apk` file
- Install it on any Android phone

**Free tier:** 15 builds/month on Expo.

---

## Step 4 — Install on Android

1. Download the `.apk` from the link Expo provides
2. On your Android phone: Settings → Security → Allow unknown sources (or "Install unknown apps")
3. Open the downloaded `.apk` → Install
4. Scratch is installed like any regular app!

---

## Step 5 — Publish to Google Play (Optional)

### Prerequisites
- Google Play Developer account ($25 one-time fee) → https://play.google.com/console
- Production AAB build:

```bash
eas build --platform android --profile production
```

### Steps in Google Play Console
1. Create new app → "Scratch"
2. Upload the `.aab` file from EAS
3. Fill in store listing: title, description, screenshots
4. Set content rating (Everyone)
5. Pricing: Free
6. Submit for review (~3–7 days)

### Screenshots needed
- 2 phone screenshots minimum (use your device)
- Feature graphic: 1024×500px
- App icon: 512×512px (already in assets/)

---

## Step 6 — Future: iOS Publishing

When you're ready:
1. Create Apple Developer account ($99/year) → https://developer.apple.com
2. Build for iOS: `eas build --platform ios --profile production`
3. Submit via EAS Submit: `eas submit --platform ios`

---

## Version Management

When you make updates:
1. Bump version in `app.json`: `"version": "1.0.1"`
2. Bump `versionCode` in android section: `"versionCode": 2`
3. Build and submit new version

---

## Over-the-Air Updates (OTA)

For JS-only changes (no native code changes), you can push updates instantly:

```bash
eas update --branch production --message "Fix: task completion bug"
```

Users get the update automatically next time they open the app — **no app store review needed!**

---

**Phase 7 complete → Scratch is live! 🚀**
