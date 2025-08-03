/*eslint-env node*/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require('ts-jest');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require('./tsconfig.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { relative } = require('path');

module.exports = {
  /** @type {import('ts-jest').InitialOptionsTsJest} */
  config: {
    preset: 'ts-jest',
    verbose: true,
    resetModules: true,
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          tsconfig: '<rootDir>/tsconfig.json',
        },
      ],
    },
    coverageReporters: ['text-summary'],
    collectCoverageFrom: [
      '**/*.(ts|tsx)',
      '!**/node_modules/**',
      '!**/__tests__/**',
      '!**/__mocks__/**',
      '!**/fixtures/**',
      '!**/testFixture/**',
      '!**/test/**',
      '!**/cypress/**',
      '!**/.vscode-test/**',
    ],
  },
  getMappedPaths(dirname) {
    return pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: `<rootDir>/${relative(dirname, __dirname)}`,
    });
  },
};
