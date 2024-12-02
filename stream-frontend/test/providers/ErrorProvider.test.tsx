import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ErrorProvider, { getErrorContext } from '../../src/providers/ErrorProvider';

describe('ErrorProvider', () => {
  test('기본 errorMessage를 제공해야 합니다', () => {
    const ErrorContext = getErrorContext();

    const TestComponent = () => {
      const { errorMessage } = React.useContext(ErrorContext);
      return <span data-testid="error-message">{errorMessage}</span>;
    };

    const { getByTestId } = render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    expect(getByTestId('error-message').textContent).toBe('');
  });

  test('updateErrorMessage를 통해 errorMessage를 업데이트해야 합니다', () => {
    const ErrorContext = getErrorContext();

    const TestComponent = () => {
      const { errorMessage, updateErrorMessage } = React.useContext(ErrorContext);
      return (
        <div>
          <span data-testid="error-message">{errorMessage}</span>
          <button onClick={() => updateErrorMessage('새로운 에러 메시지')}>
            에러 업데이트
          </button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <ErrorProvider>
        <TestComponent />
      </ErrorProvider>
    );

    // 초기 상태 검증
    expect(getByTestId('error-message').textContent).toBe('');

    // 버튼 클릭하여 에러 메시지 업데이트
    fireEvent.click(getByText('에러 업데이트'));

    // 업데이트된 상태 검증
    expect(getByTestId('error-message').textContent).toBe('새로운 에러 메시지');
  });
});
