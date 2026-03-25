const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Keep browser in the chain so socket.io-client uses its browser/WebSocket build.
    // Stub Node.js built-ins that get pulled in transitively by xmlhttprequest-ssl
    // (they are never called at runtime because we use transports: ['websocket']).
    extraNodeModules: {
      http: path.resolve(__dirname, 'emptyShim.js'),
      https: path.resolve(__dirname, 'emptyShim.js'),
      net: path.resolve(__dirname, 'emptyShim.js'),
      tls: path.resolve(__dirname, 'emptyShim.js'),
      fs: path.resolve(__dirname, 'emptyShim.js'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
