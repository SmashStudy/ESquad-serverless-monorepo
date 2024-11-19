const path = require("path");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");

const app = "meeting";

module.exports = {
  mode: "production",
  entry: ["./src/index.tsx"],
  devtool: false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(svg)$/i,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      react: path.resolve("./node_modules/react"),
      "styled-components": path.resolve("./node_modules/styled-components"),
      "react-dom": path.resolve("./node_modules/react-dom"),
    },
    fallback: {
      fs: false,
      tls: false,
    },
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: `${app}-bundle.js`,
    publicPath: "/",
    libraryTarget: "var",
    library: `app_${app}`,
  },
  plugins: [
    new HtmlWebpackPlugin({
      inlineSource: ".(js|css)$",
      template: path.resolve(__dirname, `app/${app}.html`),
      filename: path.resolve(__dirname, `dist/${app}.html`),
      inject: "head",
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [new RegExp(`${app}`)]),
  ],
  devServer: {
    proxy: {
      "/api": {
        target: "https://api.esquad.click/dev", // 백엔드 API 주소
        secure: false, // SSL 인증서 검증 비활성화
        changeOrigin: true, // 요청 헤더의 출처(origin)를 대상 서버와 일치시킴
        pathRewrite: { "^/api": "/api" }, // 경로 재작성
      },
    },
    historyApiFallback: {
      index: `/${app}.html`,
    },
    static: {
      directory: path.join(__dirname, "dist"),
    },
    devMiddleware: {
      index: `${app}.html`,
      writeToDisk: true,
    },
    client: {
      overlay: false,
    },
    hot: false,
    host: "0.0.0.0", // 모든 네트워크 인터페이스 허용
    port: 9000, // 개발 서버 포트
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, "C:\\Program Files\\mkcert\\localhost-key.pem")
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, "C:\\Program Files\\mkcert\\localhost.pem")
      ),
    },
    open: true, // 서버 실행 후 브라우저 열기
  },
};