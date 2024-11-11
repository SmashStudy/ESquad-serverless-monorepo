// jest.config.js
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
    transformIgnorePatterns: [
        '/node_modules/(?!(amazon-chime-sdk-component-library-react|uuid)/)', // amazon-chime-sdk-component-library-react와 uuid 패키지를 변환
    ],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy', // CSS 모듈을 모킹
    },
};
