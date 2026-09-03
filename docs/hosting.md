# DeTourist Demo Hosting Guide

**Goal / scope:** This guide covers how to host the DeTourist app for a live demo presentation. Attendees will install a real build via a QR code, talking to your laptop's backend. The APK downloads straight from Expo's build page, which automatically generates the QR code and install link for you. 

*Note: The download requires the audience's phone to have internet access. Live installs are Android-only.*

---

## Recommended Setup: Bring Your Own Network

The download itself comes from Expo's servers over whatever internet the audience's phone has. But once installed, the app calls your backend, which is running on your laptop. The phone still needs to be on the same network as your laptop for the app to actually work after install. 

Conference and office networks often silently block devices from reaching each other (client/AP isolation). Instead, turn on a **personal hotspot** on your phone, connect your laptop to it, and have audience members join the same hotspot. 

---

## The day before

### 1. Set the backend URL
The API URL gets compiled into the app—it can't be changed after install, so this has to be right before you build.

Turn your hotspot on, connect your laptop, and check its IP on that network:
- **Mac:** `ipconfig getifaddr en0`
- **Windows:** `ipconfig` -> IPv4 Address
- **Linux:** `hostname -I`

Set it in the mobile app's `.env` file:
```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://<your-hotspot-IP>:8000
```

### 2. Update eas.json
Make sure the `preview` profile builds an APK in `apps/mobile/eas.json`:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

### 3. Build the APK
```bash
cd apps/mobile
eas build -p android --profile preview
```
When it finishes, the CLI output and the build's page on expo.dev show a ready-made QR code and install link automatically. Keep that page open, or screenshot the QR, for use on the day; `eas build:list` finds it again later if you close it.

### 4. Test it, on the network you'll actually use
Scan the build page's QR with your own phone over the hotspot, install, and confirm it's pulling live data from your backend. This is also when you'll hit any laptop firewall prompts (Windows/Mac may ask to allow incoming connections) — approve them now.

---

## Day of the demo

### 1. Re-check your hotspot IP
If the IP has changed since you built, the installed app won't reach your backend. Rebuild if you have time, or use the fallback recording.

### 2. Start the backend
```bash
cd infra
docker compose up -d

cd ../services/backend
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
# no --reload here — you don't want the process restarting mid-demo
```

### 3. Show the QR
Open the build page you saved yesterday and project or print straight from there. No file server or separate QR-generation step needed.

---

## Troubleshooting & Important Notes

- **Download page won't load / install fails:** The audience's phone doesn't actually have internet (weak cellular, hotspot signal dropped). Fall back to a screen recording.
- **Expo account sign-in prompt:** Someone toggled off "Unauthenticated access to internal builds" in the Expo project settings. Turn it back on so anonymous downloads work.
- **App installs but shows nothing:** The IP baked into the build doesn't match the backend's current IP (see "Day of" step 1).
- **Always keep a fallback ready:** Keep a short screen recording of the working flow so a live networking hiccup doesn't stall the whole presentation.
- **iPhone Attendees:** A real iPhone install needs a paid Apple Developer account and per-device UDID registration ahead of time (`eas device:create`). For a one-off demo, drive the app yourself from your own phone or screen share for iOS attendees, and mention that iOS support will land with the App Store launch.
