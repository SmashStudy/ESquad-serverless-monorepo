import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

// 스트리밍 데이터에서 팀 속성값으로 하나의 팀을 고르는 함수
const fetchFilteredData = async ( teamId) => {
  try {
    const response = await fetch(`/data/streamingroom.json`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const roomData = await response.json();

    console.log(roomData);
  
    // teamId.S 필터링
    return roomData.filter(item => item.teamId && item.teamId.S === teamId);

  } catch (error) {
    console.error('Error fetching filtered roomData:', error);
    return [];
  }
};
//시간대별 횟수
const getHourlyFrequencies = data => {
  const hourlyFrequencies = Array(24).fill(0);
  data.forEach(session => {
    const hours = new Date(session.start_At.S).getHours();
    hourlyFrequencies[hours]++;
  });
  return hourlyFrequencies;
};
//시간 카테고리
const categorizeTime = date => {
  const hours = new Date(date).getHours();
  if (hours >= 6 && hours < 12) return "오전";
  if (hours >= 12 && hours < 18) return "오후";
  if (hours >= 18 && hours < 24) return "저녁";
  return "새벽";
};
//4시간 단위
const getTimeFrequencies = (data) => {
  const timeFrequencies = {
    "오전": 0,
    "오후": 0,
    "저녁": 0,
    "새벽": 0,
  };

  data.forEach(session => {
    const startTime = categorizeTime(session.start_At.S);
    timeFrequencies[startTime]++;
  });

  return timeFrequencies;
};

const ActivityPatternHeatmap = ({teamId}) => {
  const [roomData, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filteredData = await fetchFilteredData(teamId);      
        setData(prevData => [...prevData, ...filteredData]);
      } catch (error) {
        console.error('Error fetching roomData:', error);
      }
    };
    fetchData();
  }, []);

  // 스터디별 시간
  const hourlyFrequencies = getHourlyFrequencies(roomData);
  const frequencies = getTimeFrequencies(roomData);

  const heatmapOption = {
    title: {
      text: '시간대별 스트리밍 빈도 히트맵',
    },
    tooltip: {
      position: 'top',
    },
    xAxis: {
      type: 'category',
      roomData: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    },
    yAxis: {
      type: 'category',
      data: ['빈도'],
    },
    visualMap: {
      min: 0,
      max: Math.max(...hourlyFrequencies),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
    },
    series: [
      {
        name: '빈도',
        type: 'heatmap',
        data: hourlyFrequencies.map((value, index) => [index, 0, value]),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
  const option = {
    title: {
      text: '시간대별 스트리밍 빈도',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ["새벽", "오전", "오후", "저녁"],
    },
    yAxis: {
      type: 'value',
      name: '스트리밍 빈도',
    },
    series: [
      {
        name: '빈도',
        type: 'line',
        data: Object.values(frequencies),
      },
    ],
  };
  

  return (
    <div  style={{ height: '30vh', width: '900px'}} >
      <ReactECharts option={heatmapOption} style={{ height: '30vh', width: '100%'}} />
      {/* <ReactECharts option={option} style={{ height: '50vh', width: '50vh'}} /> */}
    </div>
  );
};

export default ActivityPatternHeatmap;
