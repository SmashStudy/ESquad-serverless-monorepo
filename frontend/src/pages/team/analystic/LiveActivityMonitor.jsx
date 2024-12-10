import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Typography, Paper } from "@mui/material";

// 스트리밍 방 데이터를 가져오는 함수
const fetchStreamingRooms = async (teamId) => {
  try {
    const response = await fetch(`/data/streamingroom.json`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const roomData = await response.json();
    return roomData.filter(item => item.teamId && item.teamId.S === teamId);
  } catch (error) {
    console.error('Error fetching filtered roomData:', error);
    return [];
  }
};

// 스트리밍 참여자 데이터를 가져오는 함수
const fetchParticipants = async (teamId) => {
  try {
    const response = await fetch(`/data/streamingparticipant.json`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const user = await response.json();
    return user.filter(item => item.teamId && item.teamId.S === teamId);
  } catch (error) {
    console.error("Error fetching participants data:", error);
    return [];
  }
};

// 현재 시간과 비교해 활성 스트리밍 방 확인
const getActiveStreamingRooms = (streamingRooms) => {
  const activeRooms = streamingRooms.filter((room) => {
    
    if (room.end_At == undefined || new Date(room.end_At.S) > new Date()) {
      // console.log(room.title.S); // 활성화된 방 출력
      return true;
    }
    return false;
  });

  // 최대 4개만 반환
  return activeRooms.slice(0, 1);
};

const LiveActivityMonitor = ({ teamId}) => {
  const [streamingRooms, setStreamingRooms] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsData = await fetchStreamingRooms(teamId);
        const participantsData = await fetchParticipants(teamId);
        setStreamingRooms(roomsData);
        setParticipants(participantsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeRooms = getActiveStreamingRooms(streamingRooms, teamId);
      
      setActiveRooms(activeRooms);

      const activeRoomIds = activeRooms.map((room) => room.title.S);
      const activeParticipants = participants.filter((participant) =>
        activeRoomIds.includes(participant.title.S)
      );
      // console.log(activeParticipants);
      
      setTotalParticipants(activeParticipants.length-60);
    
      return activeRooms.slice(0, 1);
      

      }, 1000); // 매초마다 업데이트
    return () => clearInterval(interval);
  }, [streamingRooms, participants, teamId]);

  // 원형 그래프 옵션 (활성 스트리밍 방별 참여자 수)
  const pieChartOption = {
    title: {
      text: "활성 스트리밍 방 분석",
      subtext: "참여자 수 기준",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      bottom: "left",
    },
    series: [
      {
        name: "참여자 수",
        type: "pie",
        radius: "30%",
        data: activeRooms.map((room) => ({
          name: `어린왕자 타파 ${participants.length-266}`,
          value: participants.filter(
            (participant) => participant.title.S === room.title.S
          ).length-60,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  // 라인 그래프 옵션 (총 활성 스트리밍 방 수 및 참여자 수)
  const lineChartOption = {
    title: {
      text: "실시간 스트리밍 대시보드",
      // subtext: `Esquad: ${teamId}`,
      left: "center",
    },
    xAxis: {
      type: "category",
      data: ["활성 방", "참여자 수"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [activeRooms.length, totalParticipants],
        type: "bar",
      },
    ],
  };


  return (
    <Box sx={{ padding: 1, backgroundColor: "#f5f5f5", height: "80vh" }}>
      {/* 활성 스트리밍 정보 */}
      <Paper
        elevation={3}
        sx={{
          padding: 1,
          marginBottom: 4,
          backgroundColor: "#ffffff",
          textAlign: "center",
          fontSize:'5px'        
        }}
      >
        <Typography variant="h6" sx={{fontSize:"15px"}}>
          현재 활성 스트리밍 방: {activeRooms.length}
        </Typography>
        <Typography variant="h6" sx={{fontSize:"15px"}}>
          현재 총 참여자 수: {totalParticipants}
        </Typography>
      </Paper>
        
        {/* 활성 스트리밍 정보 */}
        <Paper elevation={3} sx={{ padding: 1,
          marginBottom: 4}}>
            <ReactECharts
              option={pieChartOption}
              style={{ height: "300px", width: "100%" }}
            />
          </Paper>

          <Paper elevation={3} sx={{ padding: 1,
          marginBottom: 4 }}>
            <ReactECharts
              option={lineChartOption}
              style={{ height: "300px", width: "100%" }}
            />
          </Paper>
    </Box>
  );
};

export default LiveActivityMonitor;