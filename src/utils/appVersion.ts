/**
 * App Version Utility
 * Gets the app version from native configuration
 */

import {Platform} from 'react-native';

export interface AppVersionInfo {
  version: string;
  buildNumber: string;
  fullVersion: string;
}

/**
 * Get app version information
 * In a real app, you would use react-native-device-info or similar
 * For now, we'll return static values that match the package.json
 */
export const getAppVersion = (): AppVersionInfo => {
  // In a production app, you would use:
  // import DeviceInfo from 'react-native-device-info';
  // const version = DeviceInfo.getVersion();
  // const buildNumber = DeviceInfo.getBuildNumber();
  
  // For now, return static values
  const version = '0.1.0';
  const buildNumber = '1';
  
  return {
    version,
    buildNumber,
    fullVersion: `${version} (${buildNumber})`,
  };
};

/**
 * Get formatted version string for display
 */
export const getFormattedVersion = (): string => {
  const {version, buildNumber} = getAppVersion();
  return `${version} (${buildNumber})`;
};

/**
 * Get simple version string
 */
export const getSimpleVersion = (): string => {
  return getAppVersion().version;
};
