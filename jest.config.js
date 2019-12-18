module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/utils/get.ts"
  ],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
}

