import { Device, isVideoTransformDevice } from "amazon-chime-sdk-js";
import React, { ChangeEvent, useState, useEffect } from "react";
import {
  useBackgroundBlur,
  useBackgroundReplacement,
  FormField,
  Select,
  useVideoInputs,
  useMeetingManager,
} from "amazon-chime-sdk-component-library-react";
import {
  VideoTransformOptions,
  VideoTransformDropdownOptionType,
} from "../../../types/index";

interface Props {
  /* 드롭다운 제목, 기본값은 '비디오 변환 드롭다운'입니다 */
  label?: string;
}

export const VideoTransformDropdown: React.FC<Props> = ({
  label = "Video Transform Dropdown",
}) => {
  const [transformOption, setTransformOption] = useState(
    VideoTransformOptions.None
  );
  // 이 구성 요소는 블러 필터와 교체 필터를 모두 사용하기 때문에 두 후크가 모두 필요합니다.
  const {
    isBackgroundBlurSupported,
    createBackgroundBlurDevice,
  } = useBackgroundBlur();
  const {
    isBackgroundReplacementSupported,
    createBackgroundReplacementDevice,
  } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const meetingManager = useMeetingManager();
  const { selectedDevice } = useVideoInputs();

  // 다른 구성 요소에 의해 변경된 경우 이펙트를 사용하여 선택한 비디오 입력 장치에서 듣기
  useEffect(() => {
    if (
      !isVideoTransformDevice(selectedDevice) &&
      transformOption !== VideoTransformOptions.None
    ) {
      setTransformOption(VideoTransformOptions.None);
    }
  }, [selectedDevice]);

  // 백그라운드 블러 및 교체 제품이 제공/지원되는 경우 기반으로 사용 가능한 백그라운드 필터 옵션.
  const options: VideoTransformDropdownOptionType[] = [
    {
      label: VideoTransformOptions.None,
      value: VideoTransformOptions.None,
    },
    {
      label: VideoTransformOptions.Blur,
      value:
        isBackgroundBlurSupported === undefined ||
        isBackgroundBlurSupported === false
          ? "Background Blur not supported"
          : VideoTransformOptions.Blur,
    },
    {
      label: VideoTransformOptions.Replacement,
      value:
        isBackgroundReplacementSupported === undefined ||
        isBackgroundReplacementSupported === false
          ? "Background Replacement not supported"
          : VideoTransformOptions.Replacement,
    },
  ];

  // 선택 항목( 없음, 흐림, 교체)을 기반으로 장치를 생성하고 이를 입력으로 사용합니다.
  const selectTransform = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedTransform = e.target.value;
    let currentDevice = selectedDevice;

    if (isLoading || currentDevice === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      // 현재 선택한 장치가 변환 장치(블러 또는 대체 장치)인 경우 현재 장치를 현재 장치를 기본 장치로 저장합니다.
      if (isVideoTransformDevice(currentDevice)) {
        const intrinsicDevice = await currentDevice.intrinsicDevice();
        await currentDevice.stop();
        currentDevice = intrinsicDevice;
      }
      // 새 선택 항목이 '배경 블러'인 경우 블러 장치를 생성합니다. 그렇지 않으면 새로 선택한 변환이 교체된 경우 생성합니다
      // 교체 장치. 그렇지 않으면 사용자가 '없다'를 선택했기 때문에 현재 장치는 위 논리의 본질이므로 아무것도 하지 않습니다.
      if (
        selectedTransform === VideoTransformOptions.Blur &&
        isBackgroundBlurSupported
      ) {
        currentDevice = await createBackgroundBlurDevice(
          currentDevice as Device
        );
      } else if (
        selectedTransform === VideoTransformOptions.Replacement &&
        isBackgroundReplacementSupported
      ) {
        currentDevice = await createBackgroundReplacementDevice(
          currentDevice as Device
        );
      }
      // 위의 로직에서 새로 생성된 장치를 비디오 입력 장치로 선택합니다.
      await meetingManager.startVideoInputDevice(currentDevice);
      // 현재 선택한 변환 업데이트.
      setTransformOption(selectedTransform);
    } catch (e) {
      console.error("Error trying to apply", selectTransform, e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormField
      field={Select}
      options={options}
      onChange={selectTransform}
      value={transformOption}
      label={label}
    />
  );
};

export default VideoTransformDropdown;
