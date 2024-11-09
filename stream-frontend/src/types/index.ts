import { Logger, POSTLogger } from "amazon-chime-sdk-js";

export type FormattedDeviceType = {
  deviceId: string;
  label: string;
};

export type DeviceType = MediaDeviceInfo | FormattedDeviceType;

export type SelectedDeviceType = string | null;

export type DeviceTypeContext = {
  devices: DeviceType[];
  selectedDevice: SelectedDeviceType;
};

export type LocalVideoContextType = {
  isVideoEnabled: boolean;
  toggleVideo: () => Promise<void>;
};

export type DeviceConfig = {
  additionalDevices?: boolean;
};

export type LocalAudioOutputContextType = {
  isAudioOn: boolean;
  toggleAudio: () => void;
};

export type ContentShareControlContextType = {
  isContentSharePaused: boolean;
  toggleContentShare: () => Promise<void>;
  togglePauseContentShare: () => void;
};

export enum MeetingMode {
  Spectator,
  Attendee,
}

export enum Layout {
  Gallery,
  Featured,
}

// 백그라운드 블러 및 교체 프로세서 초기화를 위한 다양한 CPU 활용률 옵션
export const VideoFiltersCpuUtilization = {
  Disabled: "0",
  CPU10Percent: "10",
  CPU20Percent: "20",
  CPU40Percent: "40",
};

// 비디오 변환 옵션
export const VideoTransformOptions = {
  None: "None",
  Blur: "Background Blur",
  Replacement: "Background Replacement",
};

export type VideoTransformDropdownOptionType = {
  label: string;
  value: string;
};

// 캠 배경화면 교체 옵션
export enum ReplacementOptions {
  Blue = "Blue",
  Beach = "Beach",
}

export enum ReplacementType {
  Color,
  Image,
}

export type ReplacementDropdownOptionType = {
  label: ReplacementOptions;
  type: ReplacementType;
  value: string;
};

export type MeetingConfig = {
  simulcastEnabled: boolean;
  logger: Logger;
  postLogger?: POSTLogger; // 회의에 참여하는 동안 회의 메타데이터를 업데이트하려면 POSTLogger를 추적합니다.
};
