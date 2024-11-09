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
                In order to select media devices, we need to do a quick
                permissions check of your mic and camera.
              </p>
              <p>
                When the pop-up appears, choose <strong>Allow</strong>.
              </p>
            </>
          }
        />
      </ModalBody>
    </Modal>
  ) : null;
};

export default DevicePermissionPrompt;
