module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|expo-router|moti|@moti/.*))',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
