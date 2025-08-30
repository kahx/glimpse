const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// First wrap with NativeWind, then with Reanimated
const nativeWindConfig = withNativeWind(config, { input: './global.css' });

module.exports = wrapWithReanimatedMetroConfig(nativeWindConfig);