import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegionSelection from '../../../src/containers/MeetingForm/RegionSelection';
import '@testing-library/jest-dom';

// FormField와 Select 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => {
  const actual = jest.requireActual('amazon-chime-sdk-component-library-react');
  return {
    __esModule: true,
    ...actual,
    FormField: ({ label, field: Field, fieldProps = {}, ...props }: any) => (
      <div>
        <label htmlFor="field">{label}</label>
        <Field id="field" {...fieldProps} {...props} />
      </div>
    ),
    Select: ({ options, onChange, value, id, ...props }: any) => (
      <select id={id} onChange={onChange} value={value} {...props}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ),
  };
});

// select-options-format 모킹
jest.mock('../../../src/utils/select-options-format', () => ({
  __esModule: true,
  default: (regions: Record<string, string>) =>
    Object.entries(regions).map(([key, value]) => ({ value: key, label: value })),
}));

// AVAILABLE_AWS_REGIONS 모킹
jest.mock('../../../src/constants', () => ({
  __esModule: true,
  AVAILABLE_AWS_REGIONS: {
    'us-east-1': 'US East (N. Virginia)',
    'us-west-2': 'US West (Oregon)',
    'eu-central-1': 'EU (Frankfurt)',
  },
}));

import { AVAILABLE_AWS_REGIONS } from '../../../src/constants';

describe('RegionSelection 컴포넌트', () => {
  const mockSetRegion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    if (!('fetch' in globalThis)) {
      (globalThis as any).fetch = jest.fn();
    } else {
      (globalThis.fetch as jest.Mock).mockClear();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('컴포넌트가 올바르게 렌더링되는지 확인합니다.', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ region: 'us-west-2' }),
    } as Response);

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    // 실제 레이블: "호스트 지역 (자동 감지)"
    expect(screen.getByText('호스트 지역 (자동 감지)')).toBeInTheDocument();

    const selectElement = await screen.findByLabelText('호스트 지역 (자동 감지)') as HTMLSelectElement;
    expect(selectElement).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(Object.keys(AVAILABLE_AWS_REGIONS).length + 1); // 기본 옵션 + 리전 옵션

    expect(options[0]).toHaveTextContent('Select a region');
    expect(options[0]).toHaveValue('');

    Object.entries(AVAILABLE_AWS_REGIONS).forEach(([region, label], index: number) => {
      expect(options[index + 1]).toHaveTextContent(label);
      expect(options[index + 1]).toHaveValue(region);
    });

    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('region이 비어있을 때, 가장 가까운 region을 가져와 setRegion을 호출합니다.', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ region: 'us-west-2' }),
    } as Response);

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://nearest-media-region.l.chime.aws', { method: 'GET' });
    });

    expect(mockSetRegion).toHaveBeenCalledWith(expect.any(Function));

    const setRegionFunction = mockSetRegion.mock.calls[0][0];
    const updatedRegion = setRegionFunction('');
    expect(updatedRegion).toBe('us-west-2');

    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('region이 이미 설정되어 있으면, 가장 가까운 region을 가져오지 않고 setRegion을 호출하지 않습니다.', () => {
    render(<RegionSelection setRegion={mockSetRegion} region="eu-central-1" />);

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(mockSetRegion).not.toHaveBeenCalled();
  });

  test('Select를 변경하면 setRegion이 호출됩니다.', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ region: 'us-west-2' }),
    } as Response);

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    const selectElement = await screen.findByLabelText('호스트 지역 (자동 감지)') as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'us-west-2' } });

    expect(mockSetRegion).toHaveBeenCalledWith('us-west-2');

    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('fetch가 실패하면, 에러가 콘솔에 로그됩니다.', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://nearest-media-region.l.chime.aws', { method: 'GET' });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Could not fetch nearest region: ', 'Server error');

    consoleErrorSpy.mockRestore();
    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('fetch 중 에러가 발생하면, 에러가 콘솔에 로그됩니다.', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://nearest-media-region.l.chime.aws', { method: 'GET' });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Could not fetch nearest region: ', 'Network error');

    consoleErrorSpy.mockRestore();
    (globalThis.fetch as jest.Mock).mockRestore();
  });
});
