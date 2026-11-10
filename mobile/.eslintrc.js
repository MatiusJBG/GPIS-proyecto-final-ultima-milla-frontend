module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['e2e/**/*.js'],
      env: {jest: true},
      globals: {by: 'readonly', device: 'readonly', element: 'readonly'},
    },
  ],
};
