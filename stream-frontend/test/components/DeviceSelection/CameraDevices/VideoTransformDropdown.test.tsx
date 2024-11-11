// test/components/DeviceSelection/CameraDevices/VideoTransformDropdown.test.tsx

// 1. jest.mock 호출을 최상단으로 이동
jest.mock('amazon-chime-sdk-component-library-react', () => ({
    useBackgroundBlur: jest.fn(),
    useBackgroundReplacement: jest.fn(),
    useVideoInputs: jest.fn(),
    useMeetingManager: jest.fn(),
    FormField: ({ field: FieldComponent, ...props }: any) => (
      <FieldComponent {...props} />
    ),
    Select: ({ options = [], value, onChange, ...rest }: any) => (
      <select value={value} onChange={onChange} {...rest}>
        {options.map((option: any) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    ),
  }));
  
  jest.mock('amazon-chime-sdk-js', () => {
    const originalModule = jest.requireActual('amazon-chime-sdk-js');
    return {
      ...originalModule,
      isVideoTransformDevice: jest.fn(),
    };
  });
  
  // 2. 이후에 필요한 모듈을 임포트
  import React from 'react';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import VideoTransformDropdown from '../../../../src/components/DeviceSelection/CameraDevices/VideoTransformDropdown';
  import {
    useBackgroundBlur,
    useBackgroundReplacement,
    useVideoInputs,
    useMeetingManager,
  } from 'amazon-chime-sdk-component-library-react';
  import '@testing-library/jest-dom';
  import { VideoTransformDevice, Device, isVideoTransformDevice } from 'amazon-chime-sdk-js';
  import { VideoTransformOptions } from '../../../../src/types';
  
  describe('VideoTransformDropdown', () => {
    const mockUseBackgroundBlur = useBackgroundBlur as jest.Mock;
    const mockUseBackgroundReplacement = useBackgroundReplacement as jest.Mock;
    const mockUseVideoInputs = useVideoInputs as jest.Mock;
    const mockUseMeetingManager = useMeetingManager as jest.Mock;
  
    const mockCreateBackgroundBlurDevice = jest.fn();
    const mockCreateBackgroundReplacementDevice = jest.fn();
    const mockStartVideoInputDevice = jest.fn();
  
    const mockIsVideoTransformDevice = isVideoTransformDevice as jest.MockedFunction<typeof isVideoTransformDevice>;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      // Mock useBackgroundBlur
      mockUseBackgroundBlur.mockReturnValue({
        isBackgroundBlurSupported: true,
        createBackgroundBlurDevice: mockCreateBackgroundBlurDevice,
      });
  
      // Mock useBackgroundReplacement
      mockUseBackgroundReplacement.mockReturnValue({
        isBackgroundReplacementSupported: true,
        createBackgroundReplacementDevice: mockCreateBackgroundReplacementDevice,
      });
  
      // Mock useVideoInputs with a regular Device
      const mockDefaultDevice: Device = {
        id: 'default-device-id',
        name: 'Default Device',
        kind: 'videoinput',
        // 필요 시 다른 속성 추가
      } as Device;
  
      mockUseVideoInputs.mockReturnValue({
        selectedDevice: mockDefaultDevice,
      });
  
      // Mock useMeetingManager
      mockUseMeetingManager.mockReturnValue({
        startVideoInputDevice: mockStartVideoInputDevice,
      });
  
      // 기본적으로 isVideoTransformDevice는 false를 반환하도록 설정
      mockIsVideoTransformDevice.mockReturnValue(false);
    });
  
    test('올바르게 렌더링되고 모든 옵션을 표시합니다', () => {
      render(<VideoTransformDropdown />);
  
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
  
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
  
      expect(options[0]).toHaveTextContent('None');
      expect(options[0]).toHaveValue(VideoTransformOptions.None);
      expect(options[1]).toHaveTextContent('Blur');
      expect(options[1]).toHaveValue(VideoTransformOptions.Blur);
      expect(options[2]).toHaveTextContent('Replacement');
      expect(options[2]).toHaveValue(VideoTransformOptions.Replacement);
  
      expect(options[1]).not.toBeDisabled();
      expect(options[2]).not.toBeDisabled();
    });
  
    test('배경 블러가 지원되지 않는 경우 옵션이 비활성화됩니다', () => {
        // isBackgroundBlurSupported를 false로 설정하여 blur 옵션을 비활성화하도록 설정
        mockUseBackgroundBlur.mockReturnValue({
          isBackgroundBlurSupported: false,
          createBackgroundBlurDevice: jest.fn(),
        });
      
        render(<VideoTransformDropdown />);
      
        // "Background Blur"라는 label을 가진 option을 찾음
        const blurOption = screen.getByRole('option', { name: 'Background Blur' });
      
        // 해당 option의 value가 "배경 블러 지원되지 않음"인지 확인
        expect(blurOption).toHaveValue('배경 블러 지원되지 않음');
      
        // 해당 option이 비활성화되었는지 확인
        expect(blurOption).toBeDisabled();
      });
      
      
      
  
      test('백그라운드 교체가 지원되지 않는 경우 옵션이 비활성화됩니다', () => {
        // isBackgroundReplacementSupported를 false로 설정하여 replacement 옵션을 비활성화하도록 설정
        mockUseBackgroundReplacement.mockReturnValue({
          isBackgroundReplacementSupported: false,
          createBackgroundReplacementDevice: jest.fn(),
        });
      
        render(<VideoTransformDropdown />);
      
        // "Background Replacement"라는 label을 가진 option을 찾음
        const replacementOption = screen.getByRole('option', { name: 'Background Replacement' });
      
        // 해당 option의 value가 "백그라운드 교체가 지원되지 않음"인지 확인
        expect(replacementOption).toHaveValue('백그라운드 교체가 지원되지 않음');
      
        // 해당 option이 비활성화되었는지 확인
        expect(replacementOption).toBeDisabled();
      });
      
      
  
    test('배경 블러를 선택하면 관련 함수들이 호출됩니다', async () => {
      mockCreateBackgroundBlurDevice.mockResolvedValue('blur-device');
  
      render(<VideoTransformDropdown />);
  
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: VideoTransformOptions.Blur } });
  
      await waitFor(() => {
        expect(mockCreateBackgroundBlurDevice).toHaveBeenCalledWith({
          id: 'default-device-id',
          name: 'Default Device',
          kind: 'videoinput',
        });
        expect(mockStartVideoInputDevice).toHaveBeenCalledWith('blur-device');
      });
    });
  
    test('백그라운드 교체를 선택하면 관련 함수들이 호출됩니다', async () => {
      mockCreateBackgroundReplacementDevice.mockResolvedValue('replacement-device');
  
      render(<VideoTransformDropdown />);
  
      const select = screen.getByRole('combobox');
      fireEvent.change(select, {
        target: { value: VideoTransformOptions.Replacement },
      });
  
      await waitFor(() => {
        expect(mockCreateBackgroundReplacementDevice).toHaveBeenCalledWith({
          id: 'default-device-id',
          name: 'Default Device',
          kind: 'videoinput',
        });
        expect(mockStartVideoInputDevice).toHaveBeenCalledWith('replacement-device');
      });
    });
  
    test('None을 선택하면 본래의 장치로 복원됩니다', async () => {
      // VideoTransformDevice를 완전히 모킹
      const mockIntrinsicDevice: Device = {
        id: 'intrinsic-device-id',
        name: 'Intrinsic Device',
        kind: 'videoinput',
        // 필요 시 다른 속성 추가
      } as Device;
  
      const mockVideoTransformDevice: VideoTransformDevice = {
        intrinsicDevice: jest.fn().mockResolvedValue(mockIntrinsicDevice),
        stop: jest.fn(),
        // 필요 시 다른 속성 추가
        id: 'transform-device-id',
        name: 'Transform Device',
        kind: 'videoinput',
      } as unknown as VideoTransformDevice;
  
      mockUseVideoInputs.mockReturnValue({
        selectedDevice: mockVideoTransformDevice,
      });
  
      // isVideoTransformDevice를 true로 설정
      mockIsVideoTransformDevice.mockReturnValue(true);
  
      render(<VideoTransformDropdown />);
  
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: VideoTransformOptions.None } });
  
      await waitFor(() => {
        expect(mockVideoTransformDevice.stop).toHaveBeenCalled();
        expect(mockStartVideoInputDevice).toHaveBeenCalledWith(mockIntrinsicDevice);
      });
    });
  
    test('selectTransform 함수에서 오류를 처리합니다', async () => {
      mockCreateBackgroundBlurDevice.mockRejectedValue(
        new Error('Blur device error')
      );
  
      render(<VideoTransformDropdown />);
  
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
  
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: VideoTransformOptions.Blur } });
  
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '적용 시도 중 오류 발생',
          expect.any(Function),
          expect.any(Error)
        );
      });
  
      consoleErrorSpy.mockRestore();
    });
  
    test('isLoading이 true이면 진행하지 않습니다', async () => {
      // mockCreateBackgroundBlurDevice가 지연되도록 설정하여 isLoading 상태를 시뮬레이션
      mockCreateBackgroundBlurDevice.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('blur-device'), 100)));
  
      render(<VideoTransformDropdown />);
  
      const select = screen.getByRole('combobox');
  
      // 첫 번째 변경으로 isLoading을 true로 설정
      fireEvent.change(select, { target: { value: VideoTransformOptions.Blur } });
  
      // isLoading이 true인 상태에서 백그라운드 교체를 선택하려 시도
      fireEvent.change(select, {
        target: { value: VideoTransformOptions.Replacement },
      });
  
      // 첫 번째 호출만 발생해야 함을 확인
      await waitFor(() => {
        expect(mockCreateBackgroundBlurDevice).toHaveBeenCalledTimes(1);
        expect(mockCreateBackgroundReplacementDevice).not.toHaveBeenCalled();
      });
    });
  
    test('selectedDevice가 undefined인 경우 진행하지 않습니다', () => {
      mockUseVideoInputs.mockReturnValue({
        selectedDevice: undefined,
      });
  
      render(<VideoTransformDropdown />);
  
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: VideoTransformOptions.Blur } });
  
      expect(mockCreateBackgroundBlurDevice).not.toHaveBeenCalled();
      expect(mockStartVideoInputDevice).not.toHaveBeenCalled();
    });
  });
  