module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json'
        }
    },
    roots: [
        "<rootDir>/src"
    ],
    testPathIgnorePatterns: [
        "<rootDir>/src/__tests__/utils/get.ts"
    ],
    testMatch: [
        "**/__tests__/**/UrlTest*.+(ts|tsx|js)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    moduleNameMapper: {
        "#{target}\/(.*)": "<rootDir>/src/node/$1"
    },
}

