import {
  ControlBarButton,
  Cog,
  useMeetingManager,
  Camera,
  Sound,
  Dots,
  DeviceLabels,
} from "amazon-chime-sdk-component-library-react";
import React from "react";
import DevicePermissionPrompt from "../DevicePermissionPrompt";

const DevicePermissionControl = (props: { deviceLabels: DeviceLabels }) => {
  const meetingManager = useMeetingManager();

  const handleClick = async () => {
    await meetingManager.invokeDeviceProvider(props.deviceLabels);
  };

  const label =
    props.deviceLabels === DeviceLabels.AudioAndVideo
      ? "장치"
      : props.deviceLabels === DeviceLabels.Audio
      ? "오디오"
      : props.deviceLabels === DeviceLabels.Video
      ? "비디오"
      : "없음";

  const icon =
    props.deviceLabels === DeviceLabels.AudioAndVideo ? (
      <Cog />
    ) : props.deviceLabels === DeviceLabels.Audio ? (
      <Sound />
    ) : props.deviceLabels === DeviceLabels.Video ? (
      <Camera />
    ) : (
      <Dots />
    );

  return props.deviceLabels === DeviceLabels.None ? null : (
    <>
      <ControlBarButton icon={icon} onClick={handleClick} label={label} />
      <DevicePermissionPrompt />
    </>
  );
};

export default DevicePermissionControl;
