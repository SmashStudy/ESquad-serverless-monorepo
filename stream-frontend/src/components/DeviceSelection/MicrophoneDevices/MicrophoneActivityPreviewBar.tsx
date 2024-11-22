import React, { useRef } from "react";
import { useLocalAudioInputActivityPreview } from "amazon-chime-sdk-component-library-react";

import ActivityBar from "../../ActivityBar";

const MicrophoneActivityPreviewBar = () => {
  const activityBarRef = useRef<HTMLDivElement>();
  useLocalAudioInputActivityPreview(activityBarRef);

  return <ActivityBar ref={activityBarRef} />;
};

export default MicrophoneActivityPreviewBar;
