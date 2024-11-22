import React from 'react';
import { render } from '@testing-library/react';
import Spinner from '../../../../src/components/icons/Spinner';
import '@testing-library/jest-dom';

describe('Spinner 컴포넌트', () => {
  test('기본 렌더링 확인', () => {
    const { container } = render(<Spinner />);

    // SVG 요소가 렌더링 되었는지 확인
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  test('StyledSpinner가 렌더링되는지 확인', () => {
    const { container } = render(<Spinner />);

    // StyledSpinner가 존재하는지 확인
    expect(container.firstChild).not.toBeNull();
  });

  test('SVG 아이콘이 렌더링되는지 확인', () => {
    const { container } = render(<Spinner />);
    
    // SVG 요소가 제대로 렌더링되는지 확인
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });
});
