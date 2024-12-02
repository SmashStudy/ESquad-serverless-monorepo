#!/usr/bin/env node

const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

function spawnOrFail(command, args, options, printOutput = true) {
  options = {
    ...options,
    shell: true
  };
  const cmd = spawnSync(command, args, options);

  if (cmd.error) {
    console.log(`Command ${command} failed with ${cmd.error.code}`);
    process.exit(255);
  }
  const output = cmd.output.toString();
  if (printOutput) {
    console.log(output);
  }
  if (cmd.status !== 0) {
    console.log(`Command ${command} failed with exit code ${cmd.status} signal ${cmd.signal}`);
    console.log(cmd.stderr.toString());
    process.exit(cmd.status);
  }
  return output;
}

const pjson = require('../package.json');

// 서브모듈 의존성이 있는지 확인
if (pjson.dependencies['amazon-chime-sdk-component-library-react'] !== 'file:../../amazon-chime-sdk-component-library-react') {
  process.exit(0);
}

process.chdir(path.join(__dirname, '../../../amazon-chime-sdk-component-library-react'));

// node_modules가 없으면 서브모듈 설정
if (!fs.existsSync('node_modules')) {
  console.log('Setup amazon-chime-sdk-component-library-react submodule');
  spawnOrFail('git', ['submodule', 'init']);
  spawnOrFail('git', ['submodule', 'update']);
  spawnOrFail('npm', ['install']);
}

// WEBPACK_ENV 환경 변수 확인
const webpackEnv = process.env.WEBPACK_ENV;
let buildCommand;

if (webpackEnv === 'dev') {
  buildCommand = ['run', 'build'];
  console.log('Building amazon-chime-sdk-component-library-react submodule with build');
} else if (webpackEnv === 'local') {
  buildCommand = ['run', 'build_local'];
  console.log('Building amazon-chime-sdk-component-library-react submodule with build_local');
} else {
  console.log('Skipping build for amazon-chime-sdk-component-library-react submodule');
  process.exit(0);
}

// 지정된 빌드 명령어 실행
spawnOrFail('npm', buildCommand);
