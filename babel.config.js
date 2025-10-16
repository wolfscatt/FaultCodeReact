module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@app': './src/app',
          '@components': './src/components',
          '@features': './src/features',
          '@data': './src/data',
          '@state': './src/state',
          '@theme': './src/theme',
          '@i18n': './src/i18n',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};

