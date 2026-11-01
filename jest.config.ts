import type { Config } from 'jest';
import path from 'node:path';

const config: Config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss|sass)$': '<rootDir>/test/style-mock.ts',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/test/file-mock.ts',
    // These packages are ESM-only; Jest mocks keep the jsdom suites working
    // while the production build uses the real implementations.
    '^react-markdown$': '<rootDir>/test/mocks/react-markdown.tsx',
    '^remark-gfm$': '<rootDir>/test/mocks/remark-gfm.ts',
    '^rehype-sanitize$': '<rootDir>/test/mocks/rehype-sanitize.ts',
  },
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.test.tsx'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'commonjs',
          target: 'ES2019',
          allowJs: true,
          isolatedModules: false,
        },
        diagnostics: false,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@tanstack|zustand|sonner|next-auth))',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: './coverage',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};

export default config;
