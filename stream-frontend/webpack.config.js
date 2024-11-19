const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");

const app = "meeting";

// 로컬 개발 환경에서만 HTTPS 설정
const isLocalDevelopment = process.env.NODE_ENV === 'development';

// 로컬에서만 사용하는 경로 설정
const keyPath = isLocalDevelopment ? process.env.SSL_KEY_PATH : null;
const certPath = isLocalDevelopment ? process.env.SSL_CERT_PATH : null;

// 랜덤 값 생성 함수
function getRandomValue(minLength) {
  const length = Math.max(minLength, Math.floor(Math.random() * 10) + 2); // 최소 2자리
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 랜덤 이름 목록
const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Hannah", "Ivy", "Jack"];

// 랜덤 이름 선택 함수
function getRandomName() {
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

module.exports = {
  mode: "production",
  entry: ["./src/index.tsx"],
  devtool: "inline-source-map",
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
      template: path.resolve(__dirname, `app/${app}.html`),
      filename: `${app}.html`,
      inject: "head",
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [new RegExp(`${app}-bundle.js$`)]),
  ],
  devServer: {
    proxy: {
      "/api": {
        target: "https://api.esquad.click/dev",
        secure: false,
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" },
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
    host: "0.0.0.0",
    port: 9000,
    https: isLocalDevelopment
      ? {
          key: fs.existsSync(keyPath) ? fs.readFileSync(keyPath) : undefined,
          cert: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined,
        }
      : undefined,
    open: `https://localhost:9000/?studyId=${getRandomValue(2)}&name=${getRandomName()}`,  // 랜덤 이름 및 값 삽입
  },
};
