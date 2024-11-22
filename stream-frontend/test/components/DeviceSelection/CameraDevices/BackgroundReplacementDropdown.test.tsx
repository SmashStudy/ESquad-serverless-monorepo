import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BackgroundReplacementDropdown from '../../../../src/components/DeviceSelection/CameraDevices/BackgroundReplacementDropdown';
import { useAppState } from '../../../../src/providers/AppStateProvider';
import {
  useBackgroundReplacement,
  useVideoInputs,
  useLogger,
} from 'amazon-chime-sdk-component-library-react';
import { createBlob } from '../../../../src/utils/background-replacement';
import '@testing-library/jest-dom';

jest.mock('../../../../src/providers/AppStateProvider');
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  useBackgroundReplacement: jest.fn(),
  useVideoInputs: jest.fn(),
  useLogger: jest.fn(),
  FormField: ({ field: FieldComponent, ...props }: any) => (
    <FieldComponent {...props} />
  ),
  Select: ({ options = [], value, onChange, ...rest }: any) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <select value={value} onChange={handleChange} {...rest}>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {/* 테스트에서 존재하지 않는 옵션을 선택할 수 있도록 함 */}
        <option value="non-existent">Non-existent</option>
      </select>
    );
  },
}));
jest.mock('../../../../src/utils/background-replacement');

describe('BackgroundReplacementDropdown', () => {
  const mockUseAppState = useAppState as jest.Mock;
  const mockUseBackgroundReplacement = useBackgroundReplacement as jest.Mock;
  const mockUseVideoInputs = useVideoInputs as jest.Mock;
  const mockUseLogger = useLogger as jest.Mock;
  const mockCreateBlob = createBlob as jest.Mock;

  const mockSetBackgroundReplacementOption = jest.fn();
  const mockChangeBackgroundReplacementImage = jest.fn();
  const mockLoggerInfo = jest.fn();
  const mockLoggerError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAppState.mockReturnValue({
      backgroundReplacementOption: 'None',
      setBackgroundReplacementOption: mockSetBackgroundReplacementOption,
      replacementOptionsList: [
        { value: 'None', label: 'None' },
        { value: 'Blue', label: 'Blue' },
        { value: 'Beach', label: 'Beach' },
      ],
    });

    mockUseBackgroundReplacement.mockReturnValue({
      isBackgroundReplacementSupported: true,
      changeBackgroundReplacementImage: mockChangeBackgroundReplacementImage,
    });

    mockUseVideoInputs.mockReturnValue({
      selectedDevice: { deviceId: 'test-device-id' },
    });

    mockUseLogger.mockReturnValue({
      info: mockLoggerInfo,
      error: mockLoggerError,
    });

    mockCreateBlob.mockResolvedValue(new Blob(['test'], { type: 'image/png' }));
  });

  test('배경 교체 기능이 지원되는 경우 드롭다운을 렌더링합니다', () => {
    render(<BackgroundReplacementDropdown />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  test('배경 교체 기능이 지원되지 않는 경우 아무 것도 렌더링하지 않습니다', () => {
    mockUseBackgroundReplacement.mockReturnValue({
      isBackgroundReplacementSupported: false,
    });

    render(<BackgroundReplacementDropdown />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  test('유효한 옵션을 선택하면 배경 이미지가 변경됩니다', async () => {
    render(<BackgroundReplacementDropdown />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Blue' } });

    await waitFor(() => {
      expect(mockSetBackgroundReplacementOption).toHaveBeenCalledWith('Blue');
      expect(mockCreateBlob).toHaveBeenCalledWith({ value: 'Blue', label: 'Blue' });
      expect(mockChangeBackgroundReplacementImage).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockLoggerInfo).toHaveBeenCalledWith('Video filter changed to Replacement - Blue');
    });
  });

  test('존재하지 않는 옵션을 선택하면 에러를 로깅합니다', async () => {
    render(<BackgroundReplacementDropdown />);

    const select = screen.getByRole('combobox');

    // 'non-existent' 옵션은 이미 Select 모의 컴포넌트에 추가되어 있습니다.
    fireEvent.change(select, { target: { value: 'non-existent' } });

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        expect.stringContaining('Cannot find non-existent')
      );
    });

    expect(mockSetBackgroundReplacementOption).not.toHaveBeenCalled();
    expect(mockChangeBackgroundReplacementImage).not.toHaveBeenCalled();
  });

  test('changeBackgroundReplacementImage 호출 시 에러가 발생하면 에러를 로깅합니다', async () => {
    mockChangeBackgroundReplacementImage.mockRejectedValue(new Error('Test Error'));

    render(<BackgroundReplacementDropdown />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Beach' } });

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Error trying to apply Beach: Error: Test Error'
      );
    });

    expect(mockSetBackgroundReplacementOption).not.toHaveBeenCalled();
  });

  test('로딩 중이거나 선택된 장치가 없을 때 동작하지 않습니다', () => {
    mockUseVideoInputs.mockReturnValue({
      selectedDevice: undefined,
    });

    render(<BackgroundReplacementDropdown />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Blue' } });

    expect(mockSetBackgroundReplacementOption).not.toHaveBeenCalled();
    expect(mockChangeBackgroundReplacementImage).not.toHaveBeenCalled();
  });
});
