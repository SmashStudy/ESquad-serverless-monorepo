import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

// 데이터를 필터링하여 특정 팀의 멤버별 데이터를 가져오는 함수
const fetchFilteredData = async (teamId) => {
  try {
    const response = await fetch(`/data/streamingparticipant.json`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const roomData = await response.json();

    // teamId에 해당하는 데이터 필터링
    return roomData.filter((item) => item.teamId && item.teamId.S === teamId);
  } catch (error) {
    console.error("Error fetching filtered roomData:", error);
    return [];
  }
};

// 멤버별 참여 횟수와 시간을 계산
const calculateMemberContributions = (data, targetTeamId) => {
  const teamContributions = {};
  data.forEach((session) => {
    
    if(session.end_At!==undefined){
      const member = session.user_Email.S;
      const team = session.teamId.S; // 세션에서 팀 정보 가져오기
      const startTime = new Date(session.start_At.S);
      const endTime = new Date(session.end_At.S);
      const duration = (endTime - startTime) / (1000 * 60); // 분 단위로 계산

      // 특정 팀에 대해서만 계산
      if (team == targetTeamId) {
        if (!teamContributions[member]) {
          teamContributions[member] = { count: 0, time: 0 };
        }

        teamContributions[member].count++;
        teamContributions[member].time += duration;
      }
    } 
  });

  return teamContributions;
};

const MemberContributionDashboard = ({teamId}) => {
  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filteredData = await fetchFilteredData(teamId);
        setRoomData(filteredData);
      } catch (error) {
        console.error("Error fetching roomData:", error);
      }
    };
    fetchData();
  }, []);

  // 멤버별 참여 데이터 계산
  const contributions = calculateMemberContributions(roomData, teamId);

  // 그래프 데이터 준비
  const members = Object.keys(contributions);
  const counts = members.map((member) => contributions[member].count);
  const times = members.map((member) => contributions[member].time);

  const option = {
    title: {
      text: "멤버별 기여도 분석",
      subtext: "참여 횟수와 시간 분석",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["참여 횟수", "참여 시간 (분)"],
    },
    xAxis: {
      type: "category",
      data: members,
      name: "멤버",
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "참여 횟수",
      },
      {
        type: "value",
        name: "참여 시간 (분)",
      },
    ],
    series: [
      {
        name: "참여 횟수",
        type: "bar",
        data: counts,
        yAxisIndex: 0,
      },
      {
        name: "참여 시간 (분)",
        type: "bar",
        data: times,
        yAxisIndex: 1,
      },
    ],
  };

  return (
    <div  style={{ height: '30vh', width: '900px'}}  >
      <ReactECharts option={option} style={{ height: "30vh", width: "100%" }} />
    </div>
  );
};

export default MemberContributionDashboard;
