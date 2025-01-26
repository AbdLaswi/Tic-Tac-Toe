module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  moduleDirectories: ['node_modules', 'src'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js']
    }
  ]
};
