---
description: Build Android APK
---

# Build Android APK

Follow these steps to generate a standalone APK file that can be installed on your Android device.

1.  **Install EAS CLI** (if not already installed):
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    eas login
    ```

3.  **Run the Build Command**:
    This uses the specific `apk` profile we configured in `eas.json`.
    ```bash
    eas build --platform android --profile apk --local
    ```
    *Note: Removing `--local` will run the build on Expo's cloud servers (faster for weak computers, but may require a paid plan if queue is full). `--local` builds it on your machine.*

4.  **Locate the APK**:
    If running locally, the APK will be saved in your project folder.
    If running on cloud, EAS will provide a download link.

5.  **Install**:
    Transfer the file to your phone and tap to install.
