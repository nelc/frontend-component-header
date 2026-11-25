const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
});
module.exports.transformIgnorePatterns = [
  '/node_modules/(?!(@edx|@edunext|@openedx))',
];
module.exports.moduleNameMapper['^@edx/frontend-platform/auth$'] = '<rootDir>/node_modules/@edx/frontend-platform/auth';
// `npm ci` runs the `prepare` build, so dist/ (babel output incl. copied tests) exists; never run it.
module.exports.testPathIgnorePatterns = [
  ...(module.exports.testPathIgnorePatterns || []),
  '<rootDir>/dist/',
];
