module.exports = {
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
      '^.+\\.js$': 'babel-jest',
    },
    testEnvironment: 'jsdom',  // React에서 필요한 환경 설정
  };
  