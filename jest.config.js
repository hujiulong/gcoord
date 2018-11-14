module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: [
    '<rootDir>/test/'
  ],
  testURL: 'http://localhost/',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/helpers/'
  ],
  coverageDirectory: './coverage/',
  collectCoverage: true
};
