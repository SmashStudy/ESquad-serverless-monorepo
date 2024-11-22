import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegionSelection from '../../../src/containers/MeetingForm/RegionSelection';
import '@testing-library/jest-dom';

// 1. `amazon-chime-sdk-component-library-react`의 `FormField`와 `Select`를 올바르게 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  __esModule: true,
  ...jest.requireActual('amazon-chime-sdk-component-library-react'),
  FormField: ({ label, field: Field, ...props }: any) => (
    <div>
      <label htmlFor="field">{label}</label>
      <Field id="field" {...props} />
    </div>
  ), // `field` prop을 올바르게 처리
  Select: ({ options, onChange, value, id, ...props }: any) => (
    <select id={id} onChange={onChange} value={value} {...props}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

// 2. `select-options-format` 유틸리티를 올바르게 모킹
jest.mock('../../../src/utils/select-options-format', () => ({
  __esModule: true,
  default: (regions: Record<string, string>) =>
    Object.entries(regions).map(([key, value]) => ({ value: key, label: value })),
}));

// 3. `AVAILABLE_AWS_REGIONS`를 객체로 모킹
jest.mock('../../../src/constants', () => ({
  __esModule: true,
  AVAILABLE_AWS_REGIONS: {
    'us-east-1': 'US East (N. Virginia)',
    'us-west-2': 'US West (Oregon)',
    'eu-central-1': 'EU (Frankfurt)',
    // 필요한 추가 리전들을 여기에 포함시킵니다.
  },
}));

// 4. 모킹된 상수 임포트
import { AVAILABLE_AWS_REGIONS } from '../../../src/constants';

describe('RegionSelection 컴포넌트', () => {
  const mockSetRegion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // 5. `globalThis.fetch`가 존재하지 않으면 `jest.fn()`으로 초기화
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
    // 6. `fetch`를 모킹하여 응답 반환
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ region: 'us-west-2' }),
    } as Response);

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    // 7. 라벨 확인
    expect(screen.getByText('Meeting region')).toBeInTheDocument();

    // 8. 셀렉트 박스 확인
    const selectElement = await screen.findByLabelText('Meeting region') as HTMLSelectElement;
    expect(selectElement).toBeInTheDocument();

    // 9. 옵션 확인
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(Object.keys(AVAILABLE_AWS_REGIONS).length + 1); // 기본 옵션 + 리전 옵션

    // 10. 기본 옵션 확인
    expect(options[0]).toHaveTextContent('Select a region');
    expect(options[0]).toHaveValue('');

    // 11. 리전 옵션 확인
    Object.entries(AVAILABLE_AWS_REGIONS).forEach(([region, label], index: number) => {
      expect(options[index + 1]).toHaveTextContent(label);
      expect(options[index + 1]).toHaveValue(region);
    });

    // 12. fetch 모킹 복원
    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('region이 비어있을 때, 가장 가까운 region을 가져와 setRegion을 호출합니다.', async () => {
    // 13. `fetch`를 모킹하여 응답 반환
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ region: 'us-west-2' }),
    } as Response);

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    // 14. useEffect가 fetch를 호출했는지 확인
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://nearest-media-region.l.chime.aws', { method: 'GET' });
    });

    // 15. setRegion이 올바른 함수로 호출되었는지 확인
    expect(mockSetRegion).toHaveBeenCalledWith(expect.any(Function));

    // 16. setRegion 함수 실행하여 반환값 확인
    const setRegionFunction = mockSetRegion.mock.calls[0][0];
    const updatedRegion = setRegionFunction('');
    expect(updatedRegion).toBe('us-west-2');

    // 17. fetch 모킹 복원
    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('region이 이미 설정되어 있으면, 가장 가까운 region을 가져오지 않고 setRegion을 호출하지 않습니다.', () => {
    render(<RegionSelection setRegion={mockSetRegion} region="eu-central-1" />);

    // 18. fetch가 호출되지 않았는지 확인
    expect(globalThis.fetch).not.toHaveBeenCalled();

    // 19. setRegion이 호출되지 않았는지 확인
    expect(mockSetRegion).not.toHaveBeenCalled();
  });

  test('Select를 변경하면 setRegion이 호출됩니다.', async () => {
    // 20. `fetch`를 모킹하여 응답 반환
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ region: 'us-west-2' }),
    } as Response);

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    // 21. 셀렉트 박스 확인
    const selectElement = await screen.findByLabelText('Meeting region') as HTMLSelectElement;

    // 22. 셀렉트 박스 값 변경 시뮬레이션
    fireEvent.change(selectElement, { target: { value: 'us-west-2' } });

    // 23. setRegion이 올바르게 호출되었는지 확인
    expect(mockSetRegion).toHaveBeenCalledWith('us-west-2');

    // 24. fetch 모킹 복원
    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('fetch가 실패하면, 에러가 콘솔에 로그됩니다.', async () => {
    // 25. `fetch`를 실패로 모킹
    jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    // 26. console.error를 스파이하여 호출 여부 확인
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    // 27. fetch가 호출되었는지 확인
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://nearest-media-region.l.chime.aws', { method: 'GET' });
    });

    // 28. console.error가 올바르게 호출되었는지 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith('Could not fetch nearest region: ', 'Server error');

    // 29. 스파이 복원
    consoleErrorSpy.mockRestore();

    // 30. fetch 모킹 복원
    (globalThis.fetch as jest.Mock).mockRestore();
  });

  test('fetch 중 에러가 발생하면, 에러가 콘솔에 로그됩니다.', async () => {
    // 31. `fetch`를 에러로 모킹
    jest.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    // 32. console.error를 스파이하여 호출 여부 확인
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<RegionSelection setRegion={mockSetRegion} region="" />);

    // 33. fetch가 호출되었는지 확인
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('https://nearest-media-region.l.chime.aws', { method: 'GET' });
    });

    // 34. console.error가 올바르게 호출되었는지 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith('Could not fetch nearest region: ', 'Network error');

    // 35. 스파이 복원
    consoleErrorSpy.mockRestore();

    // 36. fetch 모킹 복원
    (globalThis.fetch as jest.Mock).mockRestore();
  });
});
