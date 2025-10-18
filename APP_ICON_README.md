# 🎨 Custom App Icon Setup

This guide explains how to add your custom app icon to the FaultCode React Native project.

## 📋 Quick Start

1. **Place your icon file** as `app_icon.png` in the project root (1024x1024 pixels recommended)
2. **Run the setup script**: `node scripts/setupAppIcon.js`
3. **Follow the instructions** to create the required icon sizes
4. **Build your app**: `yarn android` or `yarn ios`

## 📱 Required Icon Files

### Android Icons
Create these files in the respective directories:

```
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png (48x48)
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png (72x72)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png (192x192)
```

### iOS Icons
Create these files in `ios/HelloWorld/Images.xcassets/AppIcon.appiconset/`:

```
20x20@2x.png (40x40)
20x20@3x.png (60x60)
29x29@2x.png (58x58)
29x29@3x.png (87x87)
40x40@2x.png (80x80)
40x40@3x.png (120x120)
60x60@2x.png (120x120)
60x60@3x.png (180x180)
1024x1024@1x.png (1024x1024)
```

## 🔧 Automated Setup (Optional)

If you have ImageMagick installed, you can use the automated script:

```bash
# Install ImageMagick first
# Windows: https://imagemagick.org/script/download.php#windows
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Then run the generator
node scripts/generateIcons.js
```

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

## 📖 Detailed Instructions

For more detailed instructions, see: `scripts/ICON_SETUP.md`
