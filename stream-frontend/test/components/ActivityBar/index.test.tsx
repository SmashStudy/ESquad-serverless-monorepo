import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import ActivityBar from '../../../src/components/ActivityBar';

// 'ActivityBar' 컴포넌트에 대한 테스트 묶음
describe('ActivityBar', () => {
  
  // 첫 번째 테스트: 컴포넌트가 정상적으로 렌더링되고 스타일이 정확한지 확인
  test('정상적으로 렌더링되고 스타일이 정확한지 확인', () => {
    // ActivityBar 컴포넌트를 렌더링하고, 렌더링된 DOM을 container로 받음
    const { container } = render(<ActivityBar />);
    
    // Track div 요소가 렌더링되었는지 확인
    const trackElement = container.querySelector('div');
    expect(trackElement).toBeInTheDocument(); // Track div가 DOM에 존재해야 함

    // Track 내부의 Progress div 요소가 렌더링되었는지 확인
    const progressElement = trackElement?.querySelector('div');
    expect(progressElement).toBeInTheDocument(); // Progress div가 DOM에 존재해야 함

    // Progress div의 배경색이 지정된 스타일과 일치하는지 확인
    expect(progressElement).toHaveStyle('background-color: #18bc9c');
  });

  // 두 번째 테스트: ref가 Progress 컴포넌트로 제대로 전달되는지 확인
  test('ref가 Progress 컴포넌트로 제대로 전달되는지 확인', () => {
    // Progress 컴포넌트를 위한 ref 생성
    const progressRef = React.createRef<HTMLDivElement>();
    
    // ref를 ActivityBar에 전달하여 렌더링
    render(<ActivityBar ref={progressRef} />);
    
    // ref가 null이 아니어야 하며, Progress div 요소가 참조되었는지 확인
    expect(progressRef.current).not.toBeNull();
    
    // ref로 참조한 요소의 배경색이 지정된 스타일과 일치하는지 확인
    expect(progressRef.current).toHaveStyle('background-color: #18bc9c');
  });
});
