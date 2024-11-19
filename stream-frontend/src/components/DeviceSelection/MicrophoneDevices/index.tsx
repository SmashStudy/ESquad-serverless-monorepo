import React from "react";
import {
  Heading,
  MicSelection,
} from "amazon-chime-sdk-component-library-react";

import { title } from "../Styled";
import MicrophoneActivityPreview from "./MicrophoneActivityPreview";

const MicrophoneDevices = () => {
  return (
    <div>
      <Heading tag="h2" level={6} css={title}>
        오디오
      </Heading>
      <MicSelection />
      <MicrophoneActivityPreview />
    </div>
  );
};

export default MicrophoneDevices;
