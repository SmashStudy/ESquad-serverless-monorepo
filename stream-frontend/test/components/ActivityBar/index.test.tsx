import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import ActivityBar from '../../../src/components/ActivityBar';

describe('ActivityBar', () => {
  test('renders correctly and has the correct styles', () => {
    const { container } = render(<ActivityBar />);
    
    const trackElement = container.querySelector('div');
    expect(trackElement).toBeInTheDocument();

    const progressElement = trackElement?.querySelector('div');
    expect(progressElement).toBeInTheDocument();
    expect(progressElement).toHaveStyle('background-color: #18bc9c');
  });

  test('checks that ref is forwarded to Progress component', () => {
    const progressRef = React.createRef<HTMLDivElement>();
    render(<ActivityBar ref={progressRef} />);
    
    expect(progressRef.current).not.toBeNull();
    expect(progressRef.current).toHaveStyle('background-color: #18bc9c');
  });
});
