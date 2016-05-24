# zettor-client
Mobile client for IoT

## Requirements

1. [React Native](http://facebook.github.io/react-native/docs/getting-started.html) (follow Android and iOS guides)
2. Device or emulator with Google Play Services installed

## Setup

1. **Clone the repo**

  ```
  $ git clone https://github.com/eclub-sense/zettor-client.git
  $ cd zettor-client
  ```

2. **Install dependencies**

  ```
  $ npm install
  ```
  
3. **Google Sign in configuration**
   
   **Android:**
   
   * Open [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android/start-integrating#get-config)   	
   * Click on ```Get a configuration file``` button
   * Fill out a form (App name: ```Zettor```, Android package name: ```com.zettor```)
   * Continue to ```Choose and configure services```
   * Choose ```Google Sign-In```
   * Continue to ```Generate configuration files```
   * Download ```google-services.json``` and place it into ```zettor-client/android/app/``` folder

   **iOS:**
   
   * Open [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios/sdk/#get-config)
   * Click on ```Get a configuration file``` button
   * Fill out a form (App name: ```Zettor```, iOS Bundle ID: ```org.reactjs.native.example.zettor```)
   * Continue to ```Choose and configure services```
   * Choose ```Google Sign-In```
   * Continue to ```Generate configuration files```
   * Download ```GoogleService-Info.plist```
   * Open Xcode project ```zettor-client/ios/Zettor.xcodeproj```
   * Edit ```URL Types``` in the ```Info``` panel: replace predefined ```REVERSED_CLIENT_ID``` with yours (found inside ```GoogleService-Info.plist```) (don't change second URL Type ```org.reactjs.native.example.zettor```)

4. **Edit configuration file**
   * Copy ```zettor-client/config.json.dist``` into ```zettor-client/config.json```
   * Open [Google API Console](https://console.developers.google.com/)
   * Select ```Credentials```
   * Create new OAuth client ID credentials (Application type: ```Web application```)
   * Copy your client ID and paste it into ```webClientId``` in ```zettor-client/config.json```
   * Create new OAuth client ID credentials (Application type: ```iOS```, Bundle ID: ```org.reactjs.native.example.zettor```)
   * Copy your client ID and paste it into ```iosClientId``` in ```zettor-client/config.json```
   * Paste your IoT HUB server URL into ```serverUrl``` in ```zettor-client/config.json```

5. **Running on Android**:

  ```
  $ react-native run-android
  $ adb reverse tcp:8081 tcp:8081
  ```


6. **Running on iOS:**

  ```
  $ react-native run-ios
  ```
