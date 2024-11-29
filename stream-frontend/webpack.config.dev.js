const isLocalDevelopment = process.env.WEBPACK_ENV === 'local';

const config = isLocalDevelopment
  ? require("./webpack.config.local.js")
  : require("./webpack.config.js");

const HtmlWebpackPlugin = require("html-webpack-plugin");

const app = "meeting";

// 환경 변수 확인을 위한 로그 (디버깅용)
console.log(`WEBPACK_ENV is set to: ${process.env.WEBPACK_ENV}`);
console.log(`Using config file: ${isLocalDevelopment ? 'webpack.config.local.js' : 'webpack.config.js'}`);

module.exports = {
  ...config,
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    ...(config.plugins || []), // 기존 플러그인 유지
    new HtmlWebpackPlugin({
      inlineSource: ".(js|css)$",
      template: __dirname + `/app/${app}.html`,
      filename: __dirname + `/dist/${app}.html`,
      inject: "head",
    }),
  ],
};
