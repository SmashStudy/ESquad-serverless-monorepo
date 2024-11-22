import React from "react";
import { Label } from "amazon-chime-sdk-component-library-react";

import { StyledPreviewGroup } from "../Styled";
import MicrophoneActivityPreviewBar from "./MicrophoneActivityPreviewBar";

const MicrophoneActivityPreview = () => {
  return (
    <StyledPreviewGroup>
      <Label style={{ display: "block", marginBottom: ".5rem" }}>
        마이크 활동
      </Label>
      <MicrophoneActivityPreviewBar />
    </StyledPreviewGroup>
  );
};

export default MicrophoneActivityPreview;
