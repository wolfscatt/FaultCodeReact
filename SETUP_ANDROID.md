# 🔧 Android Setup & Troubleshooting

## ❌ Current Issue: Java Version Incompatibility

### Problem
```
BUG! exception in phase 'semantic analysis' in source unit '_BuildScript_'
Unsupported class file major version 68
```

This error indicates you have **Java 24** installed, but React Native 0.73.6 requires **Java 11 or 17**.

---

## ✅ Solution: Install & Use JDK 17

### Step 1: Download JDK 17
Download from one of these sources:
- **Oracle JDK 17**: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- **OpenJDK 17** (Recommended): https://adoptium.net/temurin/releases/?version=17

### Step 2: Install JDK 17
1. Run the installer
2. Note the installation path (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.0.X\`)

### Step 3: Set JAVA_HOME Environment Variable

#### Windows (PowerShell - Run as Administrator):
```powershell
# Set JAVA_HOME to JDK 17
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.X', 'Machine')

# Add to PATH
$path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
[System.Environment]::SetEnvironmentVariable('Path', "$path;$env:JAVA_HOME\bin", 'Machine')
```

#### Or via System Settings (GUI):
1. Open **System Properties** → **Advanced** → **Environment Variables**
2. Under **System Variables**, click **New**:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.X`
3. Edit **Path** variable and add: `%JAVA_HOME%\bin`

### Step 4: Verify Installation
```bash
# Close ALL terminals/PowerShell windows and open a NEW one
java -version
# Should show: openjdk version "17.0.X"

# Verify JAVA_HOME
echo $env:JAVA_HOME
# Should show: C:\Program Files\Eclipse Adoptium\jdk-17.0.X
```

### Step 5: Clean Gradle Cache
```bash
cd android
.\gradlew clean
cd ..
```

### Step 6: Run Android App
```bash
yarn android
```

---

## 🔍 Alternative: Use Gradle's Java Toolchain (Without Changing System Java)

If you need to keep Java 24 for other projects, you can configure this project to use JDK 17 specifically:

### Edit `android/build.gradle`:
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Add this at the end of the file
tasks.withType(JavaCompile).configureEach {
    options.release = 17
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}
```

### Edit `android/gradle.properties`:
```properties
# Add this line
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.X
```

---

## 📋 Required Environment for React Native 0.73.6

### ✅ Correct Versions
```
Node.js:       18.x or higher
Yarn:          1.22.x
Java (JDK):    11 or 17 (NOT 24!)
Android SDK:   API Level 33
Gradle:        8.3 (auto-downloaded)
```

### ❌ Incompatible Versions
```
Java 24:       Too new (class file version 68)
Java 8:        Too old for Gradle 8.3
Node.js 16:    Too old for RN 0.73
```

---

## 🚀 Complete Setup Checklist

### 1. Install Required Software
- [ ] **JDK 17** (not 24!) - https://adoptium.net/temurin/releases/?version=17
- [ ] **Android Studio** - https://developer.android.com/studio
- [ ] **Node.js 18+** - https://nodejs.org/
- [ ] **Yarn** - `npm install -g yarn`

### 2. Configure Android SDK
1. Open **Android Studio**
2. Go to **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Install:
   - [ ] Android 13.0 (API Level 33) - SDK Platform
   - [ ] Android SDK Build-Tools 33.0.0
   - [ ] Android Emulator
   - [ ] Android SDK Platform-Tools

### 3. Set Environment Variables
```bash
# Add to System Environment Variables
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.X
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk

# Add to PATH
%JAVA_HOME%\bin
%ANDROID_HOME%\emulator
%ANDROID_HOME%\platform-tools
```

### 4. Verify Setup
```bash
# Check versions
node --version     # Should be >= 18.0.0
yarn --version     # Should be >= 1.22.0
java -version      # Should be 17.x.x
adb --version      # Should show Android Debug Bridge

# React Native Doctor
npx react-native doctor
```

### 5. Create Android Emulator
1. Open **Android Studio**
2. Go to **Tools** → **Device Manager**
3. Click **Create Device**
4. Select **Pixel 5** (or any device)
5. Select **API Level 33** (Android 13)
6. Finish and start the emulator

### 6. Run the App
```bash
# Start Metro bundler
yarn start

# In a new terminal
yarn android
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "SDK location not found"
**Solution**:
```bash
# Create android/local.properties
echo "sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

### Issue 2: "Execution failed for task ':app:installDebug'"
**Solution**:
```bash
# Make sure an emulator is running or device is connected
adb devices  # Should show at least one device

# If no devices, start emulator from Android Studio
```

### Issue 3: "Unable to load script. Make sure you're running Metro"
**Solution**:
```bash
# Clean and restart
yarn start --reset-cache
```

### Issue 4: "Gradle build failed"
**Solution**:
```bash
cd android
.\gradlew clean
cd ..
yarn android
```

---

## 📝 Quick Reference

### Start Development
```bash
# Terminal 1: Metro bundler
yarn start

# Terminal 2: Run Android
yarn android
```

### Clean Build
```bash
cd android
.\gradlew clean
cd ..
rm -rf node_modules
yarn install
yarn android
```

### Reload App
- Press `R` twice in Metro terminal
- Or shake device/emulator and select "Reload"

### Open Dev Menu
- Emulator: Press `Ctrl + M` (Windows) or `Cmd + M` (Mac)
- Device: Shake the device

---

## 📞 Still Having Issues?

1. **Check React Native Doctor**:
   ```bash
   npx react-native doctor
   ```

2. **Check Environment**:
   ```bash
   echo $env:JAVA_HOME
   echo $env:ANDROID_HOME
   java -version
   ```

3. **Clean Everything**:
   ```bash
   # Clean node_modules
   rm -rf node_modules
   yarn install

   # Clean Metro cache
   yarn start --reset-cache

   # Clean Gradle
   cd android
   .\gradlew clean
   cd ..
   ```

4. **Verify Android Setup**:
   ```bash
   adb devices                    # Should show connected device/emulator
   adb shell getprop ro.build.version.sdk  # Should show 33 (API Level 33)
   ```

---

## ✅ After Fixing Java Version

Once you've installed JDK 17 and set JAVA_HOME:

```bash
# 1. Close ALL terminal windows
# 2. Open NEW terminal
# 3. Verify Java
java -version     # Should show 17.x.x

# 4. Clean and build
cd android
.\gradlew clean
cd ..

# 5. Run the app
yarn android
```

The app should now compile and run successfully! 🎉

