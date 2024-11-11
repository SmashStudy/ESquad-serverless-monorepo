module.exports = {
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    testMatch: [
        "<rootDir>/test/**/*.test.(ts|tsx|js)",
        "**/?(*.)+(spec|test).[tj]s?(x)",
    ],
};
