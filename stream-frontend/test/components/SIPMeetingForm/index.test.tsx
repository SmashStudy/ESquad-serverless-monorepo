// 1. `PrimaryButton`을 간단한 `<button>`으로 모킹하고 타입 명시
jest.mock('amazon-chime-sdk-component-library-react', () => ({
    ...jest.requireActual('amazon-chime-sdk-component-library-react'),
    PrimaryButton: ({ label, ...props }: { label: string; [key: string]: any }) => <button {...props}>{label}</button>,
  }));
  
  import '@testing-library/jest-dom';
  import React, { useState, ChangeEvent, FormEvent } from 'react';
  import { render, screen, fireEvent } from '@testing-library/react';
  import SIPMeetingForm from '../../../src/components/SIPMeetingForm';
  import { ThemeProvider } from 'styled-components';
  import { lightTheme } from 'amazon-chime-sdk-component-library-react';
  
  describe('SIPMeetingForm 컴포넌트', () => {
    // 2. `mockHandleSubmit` 함수 수정: 올바른 타입 유지
    const mockHandleSubmit = jest.fn((e: FormEvent<Element>) => {
      e.preventDefault(); // 기본 폼 제출 방지
      // console.log('handleSubmit called'); // 디버깅용 로그 (필요 시 주석 해제)
    });
  
    const setup = () => {
      const TestComponent = () => {
        const [meetingId, setMeetingId] = useState('test-meeting-id');
        const [voiceConnectorId, setVoiceConnectorId] = useState('test-voice-connector-id');
  
        const handleMeetingIdChange = (e: ChangeEvent<HTMLInputElement>) => {
          setMeetingId(e.target.value);
        };
  
        const handleVoiceConnectorIdChange = (e: ChangeEvent<HTMLInputElement>) => {
          setVoiceConnectorId(e.target.value);
        };
  
        return (
          <ThemeProvider theme={lightTheme}>
            <SIPMeetingForm
              meetingId={meetingId}
              voiceConnectorId={voiceConnectorId}
              onChangeMeetingId={handleMeetingIdChange}
              onChangeVoiceConnectorId={handleVoiceConnectorIdChange}
              handleSubmit={mockHandleSubmit}
            />
          </ThemeProvider>
        );
      };
  
      render(<TestComponent />);
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('컴포넌트가 렌더링된다', () => {
      setup();
  
      expect(screen.getByText('Join a meeting via SIP')).toBeInTheDocument();
      expect(screen.getByLabelText('Meeting Id')).toBeInTheDocument();
      expect(screen.getByLabelText('Voice Connector ID')).toBeInTheDocument();
      expect(screen.getByText('Get SIP URI')).toBeInTheDocument();
    });
  
    test('Meeting Id 입력 필드에서 값이 변경되면 업데이트된다', () => {
      setup();
  
      const meetingIdInput = screen.getByLabelText('Meeting Id') as HTMLInputElement;
      fireEvent.change(meetingIdInput, { target: { value: 'new-meeting-id' } });
  
      expect(meetingIdInput.value).toBe('new-meeting-id');
    });
  
    test('Voice Connector ID 입력 필드에서 값이 변경되면 업데이트된다', () => {
      setup();
  
      const voiceConnectorIdInput = screen.getByLabelText('Voice Connector ID') as HTMLInputElement;
      fireEvent.change(voiceConnectorIdInput, { target: { value: 'new-voice-connector-id' } });
  
      expect(voiceConnectorIdInput.value).toBe('new-voice-connector-id');
    });
  
    test('Get SIP URI 버튼 클릭 시 handleSubmit이 호출된다', () => {
      setup();
  
      const submitButton = screen.getByText('Get SIP URI');
      fireEvent.click(submitButton); // 버튼 클릭을 통해 폼 제출 시도
  
      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });
  
    test('Voice Connector ID 필드에 infoText가 올바르게 표시된다', () => {
      setup();
  
      expect(
        screen.getByText('You will need a SIP client in order to join the meeting.')
      ).toBeInTheDocument();
    });
  });
  