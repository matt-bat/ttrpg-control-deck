# Install TTRPG Control Deck on Android

This guide installs the official signed APK. It does not unlock, root, or convert an Echo Show and does not replace the Android Home app.

## Requirements

- An Android 6.0 (API 23) or newer device that already permits authorized APK installation. The tested target is an Echo Show 5 running an Android/LineageOS environment at 960×480.
- A Windows, macOS, or Linux computer with the current [Android SDK Platform-Tools](https://developer.android.com/tools/releases/platform-tools).
- USB debugging enabled on the Android device and a data-capable USB connection.

Stock Echo Show conversion varies by model and software release and is outside this project's scope. Do not follow instructions for another hardware revision.

## Download and verify

Download both files from the [latest GitHub release](https://github.com/matt-bat/ttrpg-control-deck/releases/latest):

- `TTRPG-Control-Deck.apk`
- `TTRPG-Control-Deck.apk.sha256`

From the download directory, verify the APK before installing it.

On Windows PowerShell:

```powershell
(Get-FileHash .\TTRPG-Control-Deck.apk -Algorithm SHA256).Hash.ToLower()
Get-Content .\TTRPG-Control-Deck.apk.sha256
```

On Linux:

```bash
sha256sum -c TTRPG-Control-Deck.apk.sha256
```

On macOS, calculate the checksum and compare it with the downloaded `.sha256` file:

```bash
shasum -a 256 TTRPG-Control-Deck.apk
cat TTRPG-Control-Deck.apk.sha256
```

The official signing-certificate SHA-256 fingerprint is:

```text
1F:B4:52:EA:51:14:51:53:89:8B:AD:12:99:EA:8F:82:8D:73:A2:34:19:2A:F6:CF:1F:AE:09:D7:9A:6D:FB:9C
```

## Install

1. Connect the device and accept its USB-debugging authorization prompt.
2. Confirm that ADB sees exactly the intended device:

   ```bash
   adb devices -l
   ```

3. Install or update the application:

   ```bash
   adb install -r TTRPG-Control-Deck.apk
   ```

4. Open **TTRPG Control Deck** from the Android app launcher.
5. Press the device Home button once to confirm that it returns to the normal tablet launcher.

`adb install -r` preserves the application's local campaign data when updating an APK signed by the same project key. Use **Setup → Generate backup** before an update when the saved campaign data matters.

## Troubleshooting

### No device or unauthorized device

- Unlock the device, reconnect the USB cable, and accept the debugging prompt.
- Try another data-capable cable or USB port.
- Run `adb kill-server`, followed by `adb start-server` and `adb devices -l`.

### Update incompatible

`INSTALL_FAILED_UPDATE_INCOMPATIBLE` means the installed copy was signed by a different key. If possible, export its configuration from **Setup** first. Removing the differently signed app is required before installing the official package and normally deletes that app's local data.

```bash
adb uninstall com.local.gmdeck
adb install TTRPG-Control-Deck.apk
```

### Home opens an older deck installation

Version 3.1.1 and newer are regular launcher applications and do not claim the Android Home role. Saved defaults from older builds may need to be replaced in **Settings → Apps → Default apps → Home app**.

On the tested LineageOS device, this command selects its normal launcher:

```bash
adb shell cmd package set-home-activity --user 0 com.android.launcher3
```

Launcher package names differ. Do not run that command unless `com.android.launcher3` is installed on the target device.

## Remove

Export any wanted configuration first, then uninstall:

```bash
adb uninstall com.local.gmdeck
```

Uninstalling normally deletes the application's locally stored campaigns, notes, combat state, and preferences.
