import {
  ActionType,
  MeetingStatus,
  Severity,
  useMeetingStatus,
  useNotificationDispatch,
} from 'amazon-chime-sdk-component-library-react';
import React, { useEffect, useState } from 'react';
import routes from '../../constants/routes';
import { useNavigate } from 'react-router-dom';

type DemoMeetingStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

const MeetingStatusNotifier: React.FC = () => {
  const meetingStatus = useMeetingStatus();
  const dispatch = useNotificationDispatch();
  const [status, setStatus] = useState<DemoMeetingStatus>();
  const navigate = useNavigate();

  const getMeetingStatusPayload = (message: string, severity: Severity) => {
    return {
      severity,
      message,
      autoClose: true,
      replaceAll: true,
    };
  };

  useEffect(() => {
    switch (meetingStatus) {
      case MeetingStatus.Loading:
        setStatus('connecting');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload('회의 연결중...', Severity.INFO),
        });
        break;
      case MeetingStatus.Succeeded:
        setStatus('connected');
        if (status === 'reconnecting') {
          dispatch({
            type: ActionType.ADD,
            payload: getMeetingStatusPayload('회의가 다시 연결됨', Severity.SUCCESS),
          });
        } else {
          dispatch({
            type: ActionType.ADD,
            payload: getMeetingStatusPayload('회의 연결됨', Severity.SUCCESS),
          });
        }
        break;
      case MeetingStatus.Reconnecting:
        setStatus('reconnecting');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload('회의 다시 연결중...', Severity.WARNING),
        });
        break;
      case MeetingStatus.Failed:
        setStatus('failed');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload(
            '재연결 시도 후에도 회의가 실패하여 홈으로 리디렉션되었습니다',
            Severity.ERROR
          ),
        });
        navigate(routes.HOME);
        break;
      case MeetingStatus.TerminalFailure:
        setStatus('failed');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload(
            '치명적인 실패로 인해 회의가 다시 연결되지 않고 홈으로 리디렉션됩니다',
            Severity.ERROR
          ),
        });
        navigate(routes.HOME);
        break;
      default:
        break;
    }
    return () => {
      setStatus(undefined);
    };
  }, [meetingStatus]);

  useEffect(() => {
    let id: NodeJS.Timeout | number;
    if (status === 'reconnecting') {
      id = setInterval(() => {
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload('Meeting reconnecting...', Severity.WARNING),
        });
      }, 10 * 1000);
    }
    return () => {
      clearInterval(id as NodeJS.Timeout);
    };
  }, [status]);

  return null;
};

export default MeetingStatusNotifier;
