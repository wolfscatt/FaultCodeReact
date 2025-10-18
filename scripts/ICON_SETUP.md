# App Icon Setup Guide

This guide explains how to add a custom app icon to your React Native project.

## 📋 Prerequisites

- Your app icon file: `app_icon.png` (1024x1024 pixels recommended)
- Image editing software (Photoshop, GIMP, or online tools)

## 🎯 Quick Setup

### Option 1: Automated (Recommended)

1. **Place your icon file** in the project root as `app_icon.png`
2. **Install ImageMagick** (for automatic resizing):
   - Windows: Download from https://imagemagick.org/script/download.php#windows
   - macOS: `brew install imagemagick`
   - Linux: `sudo apt-get install imagemagick`
3. **Run the generator**: `node scripts/generateIcons.js`

### Option 2: Manual Setup

If you prefer to create icons manually, follow these steps:

## 📱 Android Setup

Create the following icon files in the respective directories:

### Required Sizes:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png` (192x192)

## 🍎 iOS Setup

Create the following icon files in `ios/HelloWorld/Images.xcassets/AppIcon.appiconset/`:

### Required Sizes:
- `20x20@2x.png` (40x40)
- `20x20@3x.png` (60x60)
- `29x29@2x.png` (58x58)
- `29x29@3x.png` (87x87)
- `40x40@2x.png` (80x80)
- `40x40@3x.png` (120x120)
- `60x60@2x.png` (120x120)
- `60x60@3x.png` (180x180)
- `1024x1024@1x.png` (1024x1024)

## 🔧 Configuration

The Android and iOS configurations are already set up in the project:

- **Android**: `android/app/src/main/AndroidManifest.xml` references `@mipmap/ic_launcher`
- **iOS**: `ios/HelloWorld/Images.xcassets/AppIcon.appiconset/Contents.json` is configured

## ✅ Testing

After adding your icons:

1. **Clean build**: `cd android && ./gradlew clean` (Android)
2. **Build app**: `yarn android` or `yarn ios`
3. **Check device**: The new icon should appear on your device

## 🎨 Design Tips

- Use a square image (1024x1024 recommended)
- Keep important elements centered
- Avoid text that's too small
- Test on different screen densities
- Consider both light and dark themes

## 🚨 Troubleshooting

- **Icon not showing**: Clean and rebuild the project
- **Blurry icon**: Ensure you're using the correct size for each density
- **iOS icon issues**: Check that all required sizes are present
- **Android icon issues**: Verify both `ic_launcher.png` and `ic_launcher_round.png` exist
