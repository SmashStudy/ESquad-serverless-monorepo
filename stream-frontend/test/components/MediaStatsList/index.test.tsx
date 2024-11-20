import React from 'react';
import { render } from '@testing-library/react';
import MediaStatsList from '../../../src/components/MediaStatsList';
import MetricItem from '../../../src/components/MediaStatsList/MetricItem';
import '@testing-library/jest-dom';

describe('MediaStatsList 컴포넌트', () => {
  test('자식 요소 없이 렌더링될 때 오류 없이 렌더링됨', () => {
    const { container } = render(<MediaStatsList />);
    expect(container).toBeInTheDocument();
  });

  test('단일 MetricItem 자식을 전달했을 때 제대로 렌더링됨', () => {
    const metricName = '테스트 메트릭';
    const metricValues = ['값 1', '값 2'];

    const { getByText } = render(
      <MediaStatsList>
        <MetricItem metricName={metricName} metricValues={metricValues} />
      </MediaStatsList>
    );

    // MetricItem의 내용이 제대로 렌더링되었는지 확인
    expect(getByText(metricName)).toBeInTheDocument();
    metricValues.forEach((value) => {
      expect(getByText(value)).toBeInTheDocument();
    });
  });

  test('여러 MetricItem 자식을 전달했을 때 제대로 렌더링됨', () => {
    const metricItems = [
      {
        metricName: '메트릭 1',
        metricValues: ['값 1-1', '값 1-2'],
      },
      {
        metricName: '메트릭 2',
        metricValues: ['값 2-1', '값 2-2'],
      },
    ];

    const { getByText } = render(
      <MediaStatsList>
        {metricItems.map((item) => (
          <MetricItem
            key={item.metricName}
            metricName={item.metricName}
            metricValues={item.metricValues}
          />
        ))}
      </MediaStatsList>
    );

    // 모든 MetricItem의 내용이 렌더링되었는지 확인
    metricItems.forEach((item) => {
      expect(getByText(item.metricName)).toBeInTheDocument();
      item.metricValues.forEach((value) => {
        expect(getByText(value)).toBeInTheDocument();
      });
    });
  });
});
