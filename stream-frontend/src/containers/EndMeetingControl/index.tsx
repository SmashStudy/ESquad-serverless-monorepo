import React, { useState } from "react";
//import { useNavigate } from 'react-router-dom';
import {
  ControlBarButton,
  Phone,
  Modal,
  ModalBody,
  ModalHeader,
  ModalButton,
  ModalButtonGroup,
  useLogger,
} from "amazon-chime-sdk-component-library-react";

import { endMeeting } from '../../utils/api';
import { StyledP } from "./Styled";
import { useAppState } from '../../providers/AppStateProvider';
//import routes from '../../constants/routes';


const EndMeetingControl: React.FC = () => {
  const logger = useLogger();
  const [showModal, setShowModal] = useState(false);
  const toggleModal = (): void => setShowModal(!showModal);
  const { meetingId } = useAppState();
//  const navigate = useNavigate();

  const leaveMeeting = async (): Promise<void> => {
    try {
      if (meetingId) {
        await endMeeting(meetingId);
        window.close();
        //navigate(routes.HOME);
      }
    } catch (e) {
      logger.error(`Could not end meeting: ${e}`);
    }
  };


  return (
    <>
      <ControlBarButton icon={<Phone />} onClick={toggleModal} label="Leave" />
      {showModal && (
        <Modal size="md" onClose={toggleModal} rootId="modal-root">
          <ModalHeader title="회의 종료" />
          <ModalBody>
            <StyledP>
              회의를 종료하면 회의에 다시 참여할 수 없습니다. 계속하시겠습니까?
            </StyledP>
          </ModalBody>
          <ModalButtonGroup
            primaryButtons={[
              <ModalButton
                key="leave-meeting"
                onClick={leaveMeeting}
                variant="primary"
                label="회의 종료"
                closesModal
              />,
              <ModalButton
                key="cancel-meeting-ending"
                variant="secondary"
                label="취소"
                closesModal
              />,
            ]}
          />
        </Modal>
      )}
    </>
  );
};

export default EndMeetingControl;
