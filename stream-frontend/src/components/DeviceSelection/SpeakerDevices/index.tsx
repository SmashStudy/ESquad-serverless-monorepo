import React, { useState } from "react";
import {
  SpeakerSelection,
  SecondaryButton,
  useAudioOutputs,
} from "amazon-chime-sdk-component-library-react";

import TestSound from "../../../utils/TestSound";

const SpeakerDevices = () => {
  const { selectedDevice } = useAudioOutputs();
  const [selectedOutput, setSelectedOutput] = useState(selectedDevice);

  const handleChange = (deviceId: string): void => {
    setSelectedOutput(deviceId);
  };

  const handleTestSpeaker = () => {
    new TestSound(selectedOutput);
  };

  return (
    <div>
      <SpeakerSelection onChange={handleChange} />
      <SecondaryButton label="스피커 테스트" onClick={handleTestSpeaker} />
    </div>
  );
};

export default SpeakerDevices;
