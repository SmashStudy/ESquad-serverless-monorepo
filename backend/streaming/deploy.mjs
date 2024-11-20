import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 설정 (ES 모듈에서 __dirname 사용하기 위함)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파라미터
let app = 'meeting';
let region = 'us-east-1';
let stage = ''; // 변수 이름을 'stage'로 변경
let useEventBridge = false;
let disablePrintingLogs = false;

function usage() {
  console.log(`사용법: deploy.mjs [-r region] [-s stage] [-a application] [-e]`);
  console.log(`  -r, --region                   대상 지역, 기본값 '${region}'`);
  console.log(`  -s, --stage                    스테이지 이름 (옵션)`);
  console.log(`  -e, --event-bridge             EventBridge 통합 활성화, 기본값은 비활성화`);
  console.log(`  -l, --disable-printing-logs    로그 출력 비활성화`);
  console.log(`  -h, --help                     도움말 표시 및 종료`);
}

function getArgOrExit(i, args) {
  if (i >= args.length) {
    console.log('인자가 부족합니다.');
    usage();
    process.exit(1);
  }
  return args[i];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let i = 0;
  while (i < args.length) {
    switch (args[i]) {
      case '-h':
      case '--help':
        usage();
        process.exit(0);
        break;
      case '-r':
      case '--region':
        region = getArgOrExit(++i, args);
        break;
      case '-s':
      case '--stage':
        stage = getArgOrExit(++i, args);
        break;
      case '-e':
      case '--event-bridge':
        useEventBridge = true;
        break;
      case '-l':
      case '--disable-printing-logs':
        disablePrintingLogs = true;
        break;
      default:
        console.log(`잘못된 인자 ${args[i]}`);
        usage();
        process.exit(1);
    }
    ++i;
  }
}

function spawnOrFail(command, args, options = {}, printOutput = true) {
  options = {
    ...(options || {}),
    shell: true,
  };
  const cmd = spawnSync(command, args, options);

  if (cmd.error) {
    console.log(`명령어 ${command} 실행 실패: ${cmd.error.message}`);
    process.exit(255);
  }
  const stdout = cmd.stdout.toString();
  const stderr = cmd.stderr.toString();
  if (printOutput) {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
  }
  if (cmd.status !== 0) {
    console.log(`명령어 ${command}가 종료 코드 ${cmd.status} 및 신호 ${cmd.signal}로 실패했습니다.`);
    process.exit(cmd.status);
  }
  return stdout;
}

function appHtml(appName) {
  return path.join(__dirname, '..', '..', 'stream-frontend', 'dist', `${appName}.html`);
}


// function appHtml(appName) {
//   return `../dist/${appName}.html`;
// }

function ensureApp(appName = app) {
  console.log(`${appName} 애플리케이션 빌드 중`);
  spawnOrFail('npm', ['run', 'build'], { cwd: path.join(__dirname, '..') });
  fs.copySync(appHtml(appName), './src/index.html');
}

function ensureTools() {
  spawnOrFail('aws', ['--version']);
  spawnOrFail('serverless', ['--version']);
  spawnOrFail('npm', ['install']);
}

parseArgs();
ensureTools();
ensureApp();

console.log(`사용 지역: ${region}, 로그 출력 비활성화: ${disablePrintingLogs}`);

spawnOrFail('npm', ['install'], { cwd: path.join(__dirname, 'src') });

// Serverless 배포를 위한 환경 변수 설정
process.env.AWS_REGION = region;
process.env.USE_EVENT_BRIDGE = useEventBridge ? 'true' : 'false';

console.log('서버리스 애플리케이션 배포 중');

let deployArgs = ['deploy', '--region', region];
if (stage) {
  deployArgs.push('--stage', stage);
}
if (useEventBridge) {
  deployArgs.push('--useEventBridge', 'true');
}
if (!disablePrintingLogs) {
  deployArgs.push('--verbose');
}

spawnOrFail('serverless', deployArgs, {}, !disablePrintingLogs);

if (!disablePrintingLogs) {
  console.log('Amazon Chime SDK Meeting 데모 URL: ');
}

// Serverless 출력에서 API 엔드포인트 가져오기
const infoOutput = spawnOrFail('serverless', ['info'], {}, false);
const apiEndpointMatch = infoOutput.match(/endpoints:\n((?:\s+.*\n)+)/);
if (apiEndpointMatch) {
  console.log('엔드포인트 목록:');
  console.log(apiEndpointMatch[1]);
} else {
  console.log('엔드포인트 정보를 가져올 수 없습니다.');
}
