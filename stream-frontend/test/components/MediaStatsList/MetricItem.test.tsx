import React from 'react';
import { render } from '@testing-library/react';
import MetricItem from '../../../src/components/MediaStatsList/MetricItem';
import '@testing-library/jest-dom';

describe('MetricItem 컴포넌트', () => {
  test('metricValues가 비어있지 않으면 MetricItem 렌더링', () => {
    const metricName = 'Test Metric';
    const metricValues = ['Value 1', 'Value 2'];

    const { getByText } = render(
      <MetricItem metricName={metricName} metricValues={metricValues} />
    );

    // metricName이 제대로 렌더링 되었는지 확인
    expect(getByText(metricName)).toBeInTheDocument();

    // 각 metricValue가 렌더링 되었는지 확인
    metricValues.forEach((value) => {
      expect(getByText(value)).toBeInTheDocument();
    });
  });

  test('metricValues가 비어있으면 MetricItem이 렌더링되지 않음', () => {
    const metricName = 'Test Metric';
    const metricValues: string[] = [];

    const { queryByText } = render(
      <MetricItem metricName={metricName} metricValues={metricValues} />
    );

    // metricName은 렌더링되지 않음
    expect(queryByText(metricName)).not.toBeInTheDocument();
    // metricValues가 비어있으므로, 관련 값들도 렌더링되지 않음
    expect(queryByText('Value 1')).not.toBeInTheDocument();
    expect(queryByText('Value 2')).not.toBeInTheDocument();
  });

  test('metricValues에 빈 문자열이 포함되어 있으면 MetricItem이 렌더링되지 않음', () => {
    const metricName = 'Test Metric';
    const metricValues = ['', 'Value 2'];

    const { queryByText } = render(
      <MetricItem metricName={metricName} metricValues={metricValues} />
    );

    // metricName은 렌더링되지 않음
    expect(queryByText(metricName)).not.toBeInTheDocument();
    // 다른 값들도 렌더링되지 않음
    expect(queryByText('Value 2')).not.toBeInTheDocument();
  });
});
