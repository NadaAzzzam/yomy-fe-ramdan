# Building for Android

This project uses **Capacitor** to run the web app inside a native Android app.

## Prerequisites

- **Node.js** (already used for this project)
- **Android Studio** – [Download](https://developer.android.com/studio)
- **JDK 17** – Android Studio usually installs this; otherwise install separately

## 1. Build the web app and sync to Android

Whenever you change the web code, run:

```bash
npm run build:android
```

This runs `npm run build` (Vite) and then `cap sync android` so the `android` project gets the latest files from `dist/`.

Or step by step:

```bash
npm run build
npx cap sync android
```

## 2. Open the project in Android Studio

```bash
npm run cap:android
```

Or:

```bash
npx cap open android
```

This opens the **`android`** folder in Android Studio.

## 3. What to do in Android Studio

### First time / setup

1. **Wait for Gradle sync**  
   When the project opens, Android Studio will sync Gradle. Wait until it finishes (progress at the bottom).

2. **Install SDK components if prompted**  
   If you see errors about missing SDK or build tools, use **File → Settings → Appearance & Behavior → System Settings → Android SDK** and install the recommended components (e.g. Android SDK Platform, Build-Tools).

3. **Set up a device or emulator**
   - **Physical device:** Enable **Developer options** and **USB debugging** on your phone, then connect via USB. It should appear in the device dropdown.
   - **Emulator:** **Tools → Device Manager → Create Device**, pick a phone, then download a system image (e.g. API 34) and finish the wizard.

### Run the app

1. Select your device or emulator from the dropdown at the top.
2. Click the green **Run** button (or **Run → Run 'app'**).
3. The app will build and install on the device/emulator.

### Build a release APK or App Bundle (for Play Store)

1. **Create a signing key** (if you don’t have one):
   - **Build → Generate Signed Bundle / APK**
   - Choose **Android App Bundle** (recommended for Play Store) or **APK**
   - **Create new...** under Key store path and fill in the form (remember the passwords and path)

2. **Build signed bundle/APK:**
   - **Build → Generate Signed Bundle / APK**
   - Select your keystore, enter passwords, choose **release**
   - Finish the wizard; the file will be in `android/app/release/` (or the path you chose)

3. **Or use debug APK for testing:**  
   **Build → Build Bundle(s) / APK(s) → Build APK(s)**. The debug APK is in `android/app/build/outputs/apk/debug/`.

## 4. Workflow summary

| What you did              | What to run                    |
|---------------------------|--------------------------------|
| Changed web (React) code  | `npm run build:android`        |
| Ready to run on device    | `npm run cap:android` → Run in Android Studio |
| Need release for store    | In Android Studio: **Build → Generate Signed Bundle / APK** |

## 5. App configuration

- **App ID:** `com.yomy.ramdan` (set in `capacitor.config.ts`)
- **App name:** يومي في رمضان  
To change them, edit `capacitor.config.ts`, then run `npm run build:android` again.

## Troubleshooting

- **“SDK location not found”**  
  Create `android/local.properties` with:
  ```properties
  sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
  ```
  (Use your real Windows path to the Android SDK; Android Studio can create this for you when you open the project.)

- **Gradle sync failed**  
  Use **File → Invalidate Caches → Invalidate and Restart**, then sync again. Ensure you have JDK 17 and the Android SDK installed.

- **White screen or old content on device**  
  Run `npm run build:android` and then run the app again from Android Studio so the latest `dist` is copied into the Android project.
