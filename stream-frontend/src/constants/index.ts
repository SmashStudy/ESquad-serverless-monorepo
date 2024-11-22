import { LogLevel } from "amazon-chime-sdk-js";

export const AMAZON_CHIME_VOICE_CONNECTOR_PHONE_NUMDER = "+17035550122";

export const VIDEO_INPUT = {
  NONE: "None",
  BLUE: "Blue",
  SMPTE: "SMPTE Color Bars",
};

export const AUDIO_INPUT = {
  NONE: "None",
  440: "440 Hz",
};

export const MAX_REMOTE_VIDEOS = 25;

export const AVAILABLE_AWS_REGIONS = {
  "us-east-1": "미국 (버지니아 북부)",
  "af-south-1": "아프리카 (케이프타운)",
  "ap-northeast-1": "일본 (도쿄)",
  "ap-northeast-2": "한국 (서울)",
  "ap-south-1": "인도 (뭄바이)",
  "ap-southeast-1": "싱가폴",
  "ap-southeast-2": "호주 (시드니)",
  "ca-central-1": "캐나다",
  "eu-central-1": "독일 (프랑크푸르트)",
  "eu-north-1": "스웨덴 (스톡홀름)",
  "eu-south-1": "이탈리아 (밀라노)",
  "eu-west-1": "아일랜드",
  "eu-west-2": "영국 (런던)",
  "eu-west-3": "프랑스 (파리)",
  "sa-east-1": "브라질 (상파울루)",
  "us-east-2": "미국 (오하이오)",
  "us-west-1": "미국 (캘리포니아 북부)",
  "us-west-2": "미국 (오리건)",
};

export const VIDEO_INPUT_QUALITY = {
  "360p": "360p (nHD) @ 15 fps (600 Kbps max)",
  "540p": "540p (qHD) @ 15 fps (1.4 Mbps max)",
  "720p": "720p (HD) @ 15 fps (1.4 Mbps max)",
};

export const SDK_LOG_LEVELS = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
  off: LogLevel.OFF,
};

export const DATA_MESSAGE_LIFETIME_MS = 300000;
export const DATA_MESSAGE_TOPIC = "ChimeComponentLibraryDataMessage";
