/**
 * React Native entry point
 * @format
 */

// URL polyfill for Supabase - must be imported first
import 'react-native-url-polyfill/auto';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

