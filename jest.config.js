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
