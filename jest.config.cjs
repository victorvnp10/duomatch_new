module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,jsx}', '<rootDir>/src/**/*.{spec,test}.{js,jsx}'],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test/jest.setup.cjs'],
  testEnvironmentOptions: { url: 'http://localhost/' },
  transform: { '^.+\\.[jt]sx?$': ['babel-jest', {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
  }] },
  resetMocks: true,
};
