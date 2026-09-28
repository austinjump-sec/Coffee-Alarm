# ☕ CoffeeAlarm

CoffeeAlarm is a DIY alarm app for a coffee machine equipped with an ESP32 and a servo motor. Set an alarm on your Android phone, let the app discover the ESP32 over your local Wi-Fi network, and the ESP32 moves the servo to press the machine's physical button when the alarm fires.

> **Safety first:** This project physically operates an appliance. Use a low-voltage, mechanically isolated button pusher, keep electronics away from water and heat, and test the servo with the coffee machine unplugged or otherwise safe. Never modify mains wiring unless you are qualified to do so.

## How it works

1. CoffeeAlarm stores alarms locally on the phone with AsyncStorage.
2. The app schedules the alarm using Android alarm/notification services and can play an alarm sound in the background.
3. On the local network, the app scans for an HTTP service advertised through mDNS/Zeroconf. The ESP32 should advertise itself as `alarm-esp32` or `alarm-espresso`.
4. After discovery, the app communicates with the ESP32 using its resolved local address:
   - `GET /status` checks connectivity.
   - `POST /alarms` sends or updates an alarm as JSON.
   - `DELETE /alarms/:id` removes an alarm from the ESP32.
5. At the configured time, the ESP32 activates the servo long enough to press the coffee machine button, then returns it to its resting position.

The ESP32 firmware is a separate part of the rig. It must provide the HTTP endpoints above, advertise one of the expected mDNS names, and implement the servo motion and alarm timing. This repository contains the React Native client, not a complete ESP32 firmware sketch.

## Hardware

Typical parts:

- ESP32 development board
- Small positional servo (for example, an SG90 or equivalent)
- Servo bracket, arm, or 3D-printed mount aligned with the coffee machine button
- Separate regulated 5 V supply suitable for the servo current
- Jumper wires, breadboard or terminal block, and a common ground
- Coffee machine with a physical button that can be pressed mechanically

### Wiring guidance

- Connect the servo signal wire to a PWM-capable ESP32 GPIO selected by your firmware.
- Power the servo from an appropriate external 5 V supply; do not assume the ESP32 3.3 V pin can supply the servo.
- Connect the external supply ground to ESP32 ground.
- Keep the servo power wiring short and provide adequate current capacity. A servo can cause voltage dips and ESP32 resets when it starts moving.
- Start with conservative servo angles and travel. Adjust the mount and software limits so the arm cannot jam or continuously press the button.

## ESP32 firmware checklist

Your firmware should:

- Connect the ESP32 to the same Wi-Fi network as the Android phone.
- Start an HTTP server on the advertised service port.
- Advertise `_http._tcp` over mDNS with the instance name `alarm-esp32` or `alarm-espresso`.
- Return a successful response from `GET /status`.
- Accept the alarm object from `POST /alarms` and retain enabled schedules.
- Remove an alarm on `DELETE /alarms/:id`.
- Trigger the servo only once for each due alarm, with a configurable press and release position.
- Handle Wi-Fi loss, invalid JSON, duplicate alarm IDs, and reboot persistence gracefully.

The app sends alarm data in this shape:

```json
{
  "id": "1712345678901",
  "time": "07:30",
  "label": "Weekday coffee",
  "enabled": true,
  "days": ["Monday", "Tuesday"],
  "soundId": "beep"
}
```

## App setup from source

This is an Expo React Native project. The current project uses Expo SDK 57 and React Native 0.86.

### Requirements

- Node.js and npm
- Android Studio/Android SDK for a local Android build, or an Expo/EAS build environment
- Android phone and ESP32 on the same Wi-Fi network

Install dependencies and start the development server:

```bash
npm install
npx expo start
```


For a local Android development build:

```bash
npx expo run:android
```

The app requests network discovery/network access, notifications, wake-lock, and exact-alarm capabilities needed for discovery and reliable alarms. Android may still require you to grant notification and exact-alarm access in system settings.

## Sideload the Android APK

A prebuilt APK is available from the repository's configured Expo artifact link:

[Download the CoffeeAlarm APK](https://expo.dev/artifacts/eas/arxVxL6hMK15unqnzZw_DOGovkMfOHk7Wss0KLwrFiY.apk)

To install it on an Android phone:

1. Download the `.apk` on the phone, or download it to a computer and transfer it to the phone.
2. Open the APK with the Files/Downloads app.
3. If Android blocks the installation, open the prompt or go to **Settings → Install unknown apps** and allow the app you used to open the APK (for example, Files or Chrome).
4. Confirm **Install**, then open **CoffeeAlarm**.
5. Grant notification, nearby/local-network, and alarm-related permissions when prompted. If exact alarms are not enabled automatically, enable CoffeeAlarm under the Android alarm/reminder or exact-alarm settings.
6. Put the phone and ESP32 on the same 2.4 GHz Wi-Fi network if your access point separates bands.

Only install APKs you built yourself or obtained from a source you trust. An APK distributed outside Google Play is not automatically verified by Google Play Protect; review the build source and artifact before installing.

### Build your own APK

For a reproducible release build, configure EAS for this Expo project and build an installable Android APK. An EAS profile must produce an APK rather than an AAB for direct sideloading. For example, after installing/configuring the EAS CLI and logging in:

```bash
npm install
npx eas build:configure
npx eas build --platform android --profile preview
```

Download the resulting APK from the EAS build page, then follow the sideload steps above. The exact EAS profile and credentials are intentionally left to the maintainer; do not commit signing keys or secrets.

## First-use checklist

1. Mount the servo so its arm lines up with the coffee machine button.
2. Test the servo at low force and confirm it returns without holding the button down.
3. Flash and configure the ESP32 firmware, then verify `GET /status` responds.
4. Install and launch CoffeeAlarm.
5. Tap **Find ESP32**, select/verify the discovered device, and tap **Test Connection**.
6. Create an alarm for a few minutes in the future and select at least one day.
7. Confirm the alarm appears on both the phone and ESP32, then supervise the first activation.

## Troubleshooting

- **ESP32 is not found:** confirm both devices are on the same LAN, Android local-network/Wi-Fi permissions are enabled, mDNS is running, and the service name is exactly `alarm-esp32` or `alarm-espresso`.
- **Connection test fails:** browse to `http://<esp32-ip>:<port>/status` from a device on the same network and check the ESP32 server logs.
- **Alarm is saved but not synchronized:** the app keeps the alarm locally when no ESP32 is connected. Reconnect, then update or recreate the alarm.
- **Alarm does not fire:** disable battery optimization for CoffeeAlarm, allow notifications and exact alarms, and check that the alarm is enabled and has selected days.
- **ESP32 resets when the servo moves:** use a separate regulated servo supply, share grounds, and add suitable bulk capacitance near the servo supply.
- **Button is not pressed reliably:** reduce the servo angle, reposition the bracket, and use a slower or staged motion rather than increasing force.

## License

This project is licensed under the [MIT License](LICENSE).
