module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  roots: ['<rootDir>/test/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'esnext',
          sourceMap: true,
        },
      },
    ],
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/test/helpers/'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
};
