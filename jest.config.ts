module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"], // Only runs test files inside `/tests`
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"], // Setup script (if needed)
  clearMocks: true, // Clears mocks automatically between tests
};