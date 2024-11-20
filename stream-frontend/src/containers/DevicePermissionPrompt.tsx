import React from "react";

import {
  Modal,
  ModalBody,
  ModalHeader,
  DeviceLabelTriggerStatus,
  useDeviceLabelTriggerStatus,
  useLogger,
} from "amazon-chime-sdk-component-library-react";

import Card from "../components/Card";

// 사용자가 브라우저 권한을 부여할 때 권한 프롬프트 표시
// 초기 렌더링 시 이미 권한이 부여되었거나 구성 요소가 로드된 경우 아무것도 표시하지 않음
const DevicePermissionPrompt = () => {
  const logger = useLogger();
  const status = useDeviceLabelTriggerStatus();

  return status === DeviceLabelTriggerStatus.IN_PROGRESS ? (
    <Modal
      size="md"
      onClose={(): void => logger.info("Permission prompt closed")}
      rootId="device-permission-modal-root"
    >
      <ModalHeader
        title="Device Label Permissions check"
        displayClose={false}
      />
      <ModalBody>
        <Card
          title="Unable to get device labels"
          description={
            <>
              <p>
                미디어 장치를 선택하려면 다음을 수행해야 합니다 마이크 및
                카메라의 권한 확인.
              </p>
              <p>
                팝업이 나타나면 다음을 선택합니다 <strong>허용</strong>.
              </p>
            </>
          }
        />
      </ModalBody>
    </Modal>
  ) : null;
};

export default DevicePermissionPrompt;
