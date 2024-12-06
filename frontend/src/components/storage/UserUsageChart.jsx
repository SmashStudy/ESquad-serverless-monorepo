import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import * as echarts from 'echarts';

const UsageChart = ({ usage, MAX_USAGE }) => {
  useEffect(() => {
    const chartDom = document.getElementById('usageGauge');
    if (chartDom) {
      echarts.dispose(chartDom);

      const myChart = echarts.init(chartDom);
      const usagePercent = (usage / MAX_USAGE) * 100;
      const option = {
        series: [
          {
            type: 'gauge',
            progress: {
              show: true,
              width: 10,
              itemStyle: {
                color: usagePercent < 30 ? '#63869e' : usagePercent < 60 ? '#f6d05f' : '#e26a6a',
              },
            },
            detail: { valueAnimation: true, formatter: '{value}%', fontSize: 20 },
            data: [{ value: usagePercent.toFixed(2), name: '사용량' }],
            animationDuration: 1000,
            animationEasing: 'circularOut',
          },
        ],
      };

      myChart.setOption(option);
    }
  }, [usage, MAX_USAGE]);

  return <Box id="usageGauge" sx={{ height: '100%' }} />;
};

export default UsageChart;
