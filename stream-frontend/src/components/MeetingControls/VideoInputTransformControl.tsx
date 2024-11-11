import {
  isVideoTransformDevice,
  VideoInputDevice,
  VideoTransformDevice,
} from "amazon-chime-sdk-js";
import React, { ReactNode, useEffect, useState } from "react";
import isEqual from "lodash.isequal";
import {
  useBackgroundBlur,
  useBackgroundReplacement,
  useVideoInputs,
  useLocalVideo,
  ControlBarButton,
  Camera,
  Spinner,
  PopOverItem,
  PopOverSeparator,
  PopOverSubMenu,
  useMeetingManager,
  isOptionActive,
  useLogger,
} from "amazon-chime-sdk-component-library-react";
import { DeviceType } from "../../types";
import useMemoCompare from "../../utils/use-memo-compare";
import { VideoTransformOptions } from "../../types/index";
import { createBlob } from "../../utils/background-replacement";
import { useAppState } from "../../providers/AppStateProvider";

interface Props {
  /** 비디오 입력 제어를 위해 표시되는 라벨은 기본적으로 '비디오'로 표시됩니다. */
  label?: string;
  /** 배경 흐림 버튼에 표시되는 라벨은 기본적으로 '배경 흐림 사용'으로 표시됩니다. */
  backgroundBlurLabel?: string;
  /** 배경 교체 버튼에 표시되는 라벨은 기본적으로 '배경 교체 활성화'로 표시됩니다. */
  backgroundReplacementLabel?: string;
}

const VideoInputTransformControl: React.FC<Props> = ({
  label = "Video",
  backgroundBlurLabel = "배경 블러 사용",
  backgroundReplacementLabel = "배경 교체 사용",
}) => {
  const meetingManager = useMeetingManager();
  const logger = useLogger();
  const { devices, selectedDevice } = useVideoInputs();
  const { isVideoEnabled, toggleVideo } = useLocalVideo();
  const {
    isBackgroundBlurSupported,
    createBackgroundBlurDevice,
  } = useBackgroundBlur();
  const {
    isBackgroundReplacementSupported,
    createBackgroundReplacementDevice,
    changeBackgroundReplacementImage,
    backgroundReplacementProcessor,
  } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const [
    dropdownWithVideoTransformOptions,
    setDropdownWithVideoTransformOptions,
  ] = useState<ReactNode[] | null>(null);
  const [activeVideoTransformOption, setActiveVideoTransformOption] = useState<
    string
  >(VideoTransformOptions.None);
  const videoDevices: DeviceType[] = useMemoCompare(
    devices,
    (prev: DeviceType[] | undefined, next: DeviceType[] | undefined): boolean =>
      isEqual(prev, next)
  );
  const {
    backgroundReplacementOption,
    setBackgroundReplacementOption,
    replacementOptionsList,
  } = useAppState();

  useEffect(() => {
    resetDeviceToIntrinsic();
  }, []);

  // 현재 비디오 입력이 변환 장치인 경우 이 구성 요소로 인해 비디오 입력을 내재적으로 재설정합니다
  // 블러 또는 교체가 선택되었는지 알 수 없습니다. 이는 데모가 설정되는 방식에 따라 달라집니다.
  // TODO: AppState의 후크를 사용하여 이 구성 요소가 장착되기 전에 블러 또는 교체가 선택되었는지 추적합니다,
  // 또는 '회의 관리자'에서 '액티브 비디오 변환 옵션' 상태를 유지합니다.
  const resetDeviceToIntrinsic = async () => {
    try {
      if (isVideoTransformDevice(selectedDevice)) {
        const intrinsicDevice = await selectedDevice.intrinsicDevice();
        await meetingManager.selectVideoInputDevice(intrinsicDevice);
      }
    } catch (error) {
      logger.error("디바이스를 내재적 디바이스로 재설정하지 못했습니다");
    }
  };

  // 배경 흐림 켜기/끄기 전환.
  const toggleBackgroundBlur = async () => {
    let current = selectedDevice;
    if (isLoading || current === undefined) {
      return;
    }
    try {
      setIsLoading(true);

      if (!isVideoTransformDevice(current)) {
        // 기본 장치에서 비디오 변환 사용.
        current = (await createBackgroundBlurDevice(
          current
        )) as VideoTransformDevice;
        logger.info(
          `비디오 필터 켜기 - 비디오 변환 장치 선택: ${JSON.stringify(
            current
          )}`
        );
      } else {
        // 내재적 장치로 다시 전환.
        const intrinsicDevice = await current.intrinsicDevice();
        // 기존 VideoTransform 장치 중지.
        await current.stop();
        current = intrinsicDevice;
        // 오래된 선택이 배경 교체인 경우 배경 흐림 장치로 전환하거나 기본 고유 장치로 전환합니다.
        if (activeVideoTransformOption === VideoTransformOptions.Replacement) {
          current = (await createBackgroundBlurDevice(
            current
          )) as VideoTransformDevice;
          logger.info(
            `비디오 필터가 켜져 있었습니다 - 비디오 변환 장치: ${JSON.stringify(
              current
            )}`
          );
        } else {
          logger.info(
            `비디오 필터가 꺼져 있었습니다 - 내부 장치 선택: ${JSON.stringify(
              current
            )}`
          );
        }
      }

      if (isVideoEnabled) {
        // 새로 생성된 비디오 장치를 입력으로 사용합니다.
        await meetingManager.startVideoInputDevice(current);
      } else {
        // 새로 생성된 비디오 장치를 선택하지만 시작하지 않습니다.
        await meetingManager.selectVideoInputDevice(current);
      }

      // 현재 선택한 변환 업데이트.
      setActiveVideoTransformOption((activeVideoTransformOption) =>
        activeVideoTransformOption === VideoTransformOptions.Blur
          ? VideoTransformOptions.None
          : VideoTransformOptions.Blur
      );
    } catch (e) {
      logger.error(`배경 흐림을 전환하는 동안 오류가 발생했습니다 ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackgroundReplacement = async () => {
    let current = selectedDevice;
    if (isLoading || current === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      if (!isVideoTransformDevice(current)) {
        // 변환되지 않은 장치에서 비디오 변환 사용.
        current = (await createBackgroundReplacementDevice(
          current
        )) as VideoTransformDevice;
        logger.info(
          `비디오 필터 켜기 - 비디오 변환 장치 선택: ${JSON.stringify(
            current
          )}`
        );
      } else {
        // 내재적 장치로 다시 전환.
        const intrinsicDevice = await current.intrinsicDevice();
        // 기존 VideoTransform 장치 중지.
        await current.stop();
        current = intrinsicDevice;
        // 이전 선택이 배경 흐림인 경우 배경 교체 장치로 전환하거나 기본 고유 장치로 전환합니다.
        if (activeVideoTransformOption === VideoTransformOptions.Blur) {
          current = (await createBackgroundReplacementDevice(
            current
          )) as VideoTransformDevice;
          logger.info(
            `비디오 필터 켜기 - 비디오 변환 장치 선택: ${JSON.stringify(
              current
            )}`
          );
        } else {
          logger.info(
            `비디오 필터가 꺼져 있었습니다 - 내부 장치 선택: ${JSON.stringify(
              current
            )}`
          );
        }
      }

      if (isVideoEnabled) {
        // 새로 생성된 비디오 장치를 입력으로 사용합니다.
        await meetingManager.startVideoInputDevice(current);
      } else {
        // 새로 생성된 비디오 장치를 선택하지만 시작하지 않습니다.
        await meetingManager.selectVideoInputDevice(current);
      }

      // 현재 선택한 변환 업데이트.
      setActiveVideoTransformOption((activeVideoTransformOption) =>
        activeVideoTransformOption === VideoTransformOptions.Replacement
          ? VideoTransformOptions.None
          : VideoTransformOptions.Replacement
      );
    } catch (e) {
      logger.error(`배경 교체를 전환하는 동안 오류가 발생했습니다 ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  const changeBackgroundReplacementOption = async (
    replacementOption: string
  ) => {
    let current = selectedDevice;
    if (isLoading || current === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      const selectedOption = replacementOptionsList.find(
        (option) => replacementOption === option.label
      );
      if (selectedOption) {
        const blob = await createBlob(selectedOption);
        logger.info(
          `비디오 필터가 교체로 변경되었습니다 - ${selectedOption.label}`
        );
        await changeBackgroundReplacementImage(blob);
        setBackgroundReplacementOption(selectedOption.label);
      } else {
        logger.error(
          `오류: 찾을 수 없음 ${replacementOption} 교체 옵션 목록에서: ${replacementOptionsList}`
        );
      }
    } catch (error) {
      logger.error(
        `배경 교체 이미지를 변경하는 동안 오류가 발생했습니다 ${error}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = async (deviceId: string): Promise<void> => {
      try {
        // 배경 흐림/교체가 켜져 있는 경우 동일한 비디오 변환 파이프라인을 재사용하되 내부 장치를 교체합니다
        // 배경 흐림/교체가 켜져 있지 않은 경우 일반 비디오 선택을 수행합니다
        let newDevice: VideoInputDevice = deviceId;
        if (isVideoTransformDevice(selectedDevice) && !isLoading) {
          setIsLoading(true);
          if ("chooseNewInnerDevice" in selectedDevice) {
            // @ts-ignore
            newDevice = selectedDevice.chooseNewInnerDevice(deviceId);
          } else {
            logger.error("변환 장치는 새 내부 장치를 선택할 수 없습니다");
            return;
          }
        }
        if (isVideoEnabled) {
          await meetingManager.startVideoInputDevice(newDevice);
        } else {
          meetingManager.selectVideoInputDevice(newDevice);
        }
      } catch (error) {
        logger.error(
          "비디오 입력 변환제어가 비디오 입력 장치를 선택하지 못했습니다"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const getDropdownWithVideoTransformOptions = async (): Promise<void> => {
      const deviceOptions: ReactNode[] = await Promise.all(
        videoDevices.map(async (option) => (
          <PopOverItem
            key={option.deviceId}
            checked={await isOptionActive(selectedDevice, option.deviceId)}
            onClick={async () => await handleClick(option.deviceId)}
          >
            <span>{option.label}</span>
          </PopOverItem>
        ))
      );

      // 선택 드롭다운에 '배경 블러 활성화'를 옵션으로 추가합니다(제공/지원되는 경우).
      if (isBackgroundBlurSupported) {
        const videoTransformOptions: ReactNode = (
          <PopOverItem
            key="backgroundBlurFilter"
            checked={activeVideoTransformOption === VideoTransformOptions.Blur}
            disabled={isLoading}
            onClick={toggleBackgroundBlur}
          >
            <>
              {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
              {backgroundBlurLabel}
            </>
          </PopOverItem>
        );
        deviceOptions.push(<PopOverSeparator key="separator1" />);
        deviceOptions.push(videoTransformOptions);
      }

      // '배경 교체 활성화'가 제공/지원되는 경우 선택 드롭다운에 옵션으로 추가합니다.
      if (isBackgroundReplacementSupported) {
        const videoTransformOptions: ReactNode = (
          <PopOverItem
            key="backgroundReplacementFilter"
            checked={
              activeVideoTransformOption === VideoTransformOptions.Replacement
            }
            disabled={isLoading}
            onClick={toggleBackgroundReplacement}
          >
            <>
              {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
              {backgroundReplacementLabel}
            </>
          </PopOverItem>
        );
        deviceOptions.push(<PopOverSeparator key="separator2" />);
        deviceOptions.push(videoTransformOptions);
      }

      // '배경 교체 필터 선택'이 제공/지원되는 경우 선택 드롭다운에 옵션으로 추가합니다.
      if (isBackgroundReplacementSupported && backgroundReplacementProcessor) {
        const replacementOptions: ReactNode = (
          <PopOverSubMenu
            key="backgrounReplacementFilterList"
            text="배경 교체 필터 선택"
          >
            {replacementOptionsList.map((option) => (
              <PopOverItem
                key={option.label}
                checked={backgroundReplacementOption === option.label}
                disabled={isLoading}
                onClick={async () =>
                  await changeBackgroundReplacementOption(option.label)
                }
              >
                <>
                  {isLoading && <Spinner width="1.5rem" height="1.5rem" />}
                  {option.label}
                </>
              </PopOverItem>
            ))}
          </PopOverSubMenu>
        );
        deviceOptions.push(<PopOverSeparator key="separator3" />);
        deviceOptions.push(replacementOptions);
      }
      setDropdownWithVideoTransformOptions(deviceOptions);
    };

    getDropdownWithVideoTransformOptions();
  }, [
    createBackgroundBlurDevice,
    createBackgroundReplacementDevice,
    meetingManager,
    meetingManager.startVideoInputDevice,
    videoDevices,
    isLoading,
    isVideoEnabled,
    selectedDevice,
    isBackgroundBlurSupported,
    isBackgroundReplacementSupported,
  ]);

  return (
    <ControlBarButton
      icon={<Camera disabled={!isVideoEnabled} />}
      onClick={toggleVideo}
      label={label}
    >
      {dropdownWithVideoTransformOptions}
    </ControlBarButton>
  );
};

export default VideoInputTransformControl;
