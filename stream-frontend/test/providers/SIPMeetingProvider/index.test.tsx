import React, { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react';
import SIPMeetingProvider, { useSIPMeetingManager } from '../../../src/providers/SIPMeetingProvider';
import { SIPMeetingManager } from '../../../src/providers/SIPMeetingProvider/SIPMeetingManager';

describe('SIPMeetingProvider와 useSIPMeetingManager 테스트', () => {
  // 예상된 에러 로그를 억제하기 위해 console.error를 Mock 처리
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  class ErrorBoundary extends React.Component<
    { children: ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    render() {
      if (this.state.hasError && this.state.error) {
        return <div data-testid="error">{this.state.error.message}</div>;
      }
      return this.props.children;
    }
  }

  test('SIPMeetingProvider 내부에서 useSIPMeetingManager를 사용하면 SIPMeetingManager 인스턴스를 반환한다', () => {
    let sipMeetingManagerFromHook: SIPMeetingManager | undefined;

    function TestComponent() {
      sipMeetingManagerFromHook = useSIPMeetingManager();
      return null;
    }

    render(
      <SIPMeetingProvider>
        <TestComponent />
      </SIPMeetingProvider>
    );

    expect(sipMeetingManagerFromHook).toBeInstanceOf(SIPMeetingManager);
  });

  test('SIPMeetingProvider 외부에서 useSIPMeetingManager를 사용하면 에러를 발생시킨다', async () => {
    function TestComponent() {
      useSIPMeetingManager();
      return null;
    }

    const { getByTestId } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    const errorMessageElement = await waitFor(() =>
      getByTestId('error')
    );

    expect(errorMessageElement.textContent).toBe(
      'useSIPMeetingManager must be used within SIPMeetingProvider'
    );
  });

  test('SIPMeetingProvider는 모든 소비자에게 동일한 SIPMeetingManager 인스턴스를 제공한다', () => {
    let managerInstance1: SIPMeetingManager | undefined;
    let managerInstance2: SIPMeetingManager | undefined;

    function TestComponent1() {
      managerInstance1 = useSIPMeetingManager();
      return null;
    }

    function TestComponent2() {
      managerInstance2 = useSIPMeetingManager();
      return null;
    }

    render(
      <SIPMeetingProvider>
        <TestComponent1 />
        <TestComponent2 />
      </SIPMeetingProvider>
    );

    expect(managerInstance1).toBe(managerInstance2);
  });
});
