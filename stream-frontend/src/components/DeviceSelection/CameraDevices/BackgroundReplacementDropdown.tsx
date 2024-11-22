import React, { ChangeEvent, useState } from "react";
import {
  useBackgroundReplacement,
  FormField,
  Select,
  useVideoInputs,
  useLogger,
} from "amazon-chime-sdk-component-library-react";
import { createBlob } from "../../../utils/background-replacement";
import { useAppState } from "../../../providers/AppStateProvider";

interface Props {
  /* 드롭다운 제목, 기본값은 '배경 교체 드롭다운'입니다 */
  label?: string;
}

export const BackgroundReplacementDropdown: React.FC<Props> = ({
  label = "Background Replacement Dropdown",
}) => {
  const { selectedDevice } = useVideoInputs();
  const {
    backgroundReplacementOption,
    setBackgroundReplacementOption,
    replacementOptionsList,
  } = useAppState();
  const {
    isBackgroundReplacementSupported,
    changeBackgroundReplacementImage,
  } = useBackgroundReplacement();
  const [isLoading, setIsLoading] = useState(false);
  const logger = useLogger();

  // 선택 항목(파란색, 해변)에 이미지 얼룩을 만들고 배경 이미지를 변경합니다.
  const selectReplacement = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectReplacement = e.target.value;
    let currentDevice = selectedDevice;

    if (isLoading || currentDevice === undefined) {
      return;
    }
    try {
      setIsLoading(true);
      const selectedOption = replacementOptionsList.find(
        (option) => selectReplacement === option.value
      );
      if (selectedOption) {
        const blob = await createBlob(selectedOption);
        logger.info(
          `Video filter changed to Replacement - ${selectedOption.label}`
        );
        await changeBackgroundReplacementImage(blob);
        setBackgroundReplacementOption(selectedOption.label);
      } else {
        logger.error(
          `Error: Cannot find ${selectReplacement} in the replacementOptionsList: ${replacementOptionsList}`
        );
      }
    } catch (e) {
      logger.error(`Error trying to apply ${selectReplacement}: ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isBackgroundReplacementSupported ? (
        <FormField
          field={Select}
          options={replacementOptionsList}
          onChange={selectReplacement}
          value={backgroundReplacementOption}
          label={label}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default BackgroundReplacementDropdown;
