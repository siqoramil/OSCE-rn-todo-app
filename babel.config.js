module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // react-native-worklets/plugin must be listed last — it powers the
    // worklets used by reanimated & react-native-keyboard-controller.
    plugins: ['react-native-worklets/plugin'],
  };
};
