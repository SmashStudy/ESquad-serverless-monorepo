import React from "react";
import {
  Heading,
  PreviewVideo,
  QualitySelection,
  CameraSelection,
  Label,
} from "amazon-chime-sdk-component-library-react";

import { title, StyledInputGroup } from "../Styled";
import { useAppState } from "../../../providers/AppStateProvider";
import { VideoFiltersCpuUtilization } from "../../../types";
import { VideoTransformDropdown } from "../CameraDevices/VideoTransformDropdown";
import { BackgroundReplacementDropdown } from "../CameraDevices/BackgroundReplacementDropdown";

const CameraDevices = () => {
  const { videoTransformCpuUtilization } = useAppState();
  const videoTransformsEnabled =
    videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;
  return (
    <div>
      <Heading tag="h2" level={6} css={title}>
        비디오
      </Heading>
      <StyledInputGroup>
        <CameraSelection />
      </StyledInputGroup>
      <StyledInputGroup>
        <QualitySelection />
      </StyledInputGroup>
      {videoTransformsEnabled ? (
        <StyledInputGroup>
          <VideoTransformDropdown />
        </StyledInputGroup>
      ) : (
        ""
      )}
      {videoTransformsEnabled ? (
        <StyledInputGroup>
          <BackgroundReplacementDropdown />
        </StyledInputGroup>
      ) : (
        ""
      )}
      <Label style={{ display: "block", marginBottom: ".5rem" }}>
        비디오 미리보기
      </Label>
      <PreviewVideo />
    </div>
  );
};

export default CameraDevices;
