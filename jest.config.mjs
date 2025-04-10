export default {
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^\\$lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
