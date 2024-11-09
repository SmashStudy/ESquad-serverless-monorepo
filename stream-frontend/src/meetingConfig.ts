import { ConsoleLogger, MultiLogger, POSTLogger } from "amazon-chime-sdk-js";
import { SDK_LOG_LEVELS } from "./constants";
import { MeetingConfig } from "./types";

const urlParams = new URLSearchParams(window.location.search);
const queryLogLevel = urlParams.get("logLevel") || "info";
const logLevel = SDK_LOG_LEVELS[queryLogLevel] || SDK_LOG_LEVELS.info;

const meetingConfig: MeetingConfig = {
  simulcastEnabled: false,
  logger: new ConsoleLogger("ChimeComponentLibraryReactDemo", logLevel),
};

const BASE_URL: string = [
  location.protocol,
  "//",
  location.host,
  location.pathname.replace(/\/*$/, "/"),
].join("");

if (!["0.0.0.0", "127.0.0.1", "localhost"].includes(location.hostname)) {
  const postLogger = new POSTLogger({
    url: `${BASE_URL}logs`,
    logLevel,
    metadata: {
      appName: "ChimeComponentLibraryReactDemo",
      timestamp: Date.now().toString(),
    },
  });
  meetingConfig.logger = new MultiLogger(meetingConfig.logger, postLogger);
  meetingConfig.postLogger = postLogger;
}

export default meetingConfig;
