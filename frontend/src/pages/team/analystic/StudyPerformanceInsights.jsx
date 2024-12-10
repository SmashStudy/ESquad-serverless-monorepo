import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

// 스터디 데이터를 필터링하여 특정 팀의 데이터를 가져오는 함수
const fetchStudiesData = async (teamId) => {
  try {
    const response = await fetch(`/data/study.json`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const studiesData = await response.json();

    // teamId에 해당하는 스터디 데이터 필터링
    return studiesData.filter((study) => study.teamId && study.teamId.S === teamId);
  } catch (error) {
    console.error("Error fetching studies data:", error);
    return [];
  }
};

// 스터디 유저 데이터를 가져오는 함수
const fetchStudyUsersData = async () => {
  try {
    const response = await fetch( `/data/studyuser.json`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching study users data:", error);
    return [];
  }
};

// 스터디별 참여 멤버 수 집계
const calculateStudyParticipation = (studies, studyUsers) => {
  const participation = studies.map((study) => {
    const studyId = study.PK.S;
    const studyName = study.studyName.S;

    // 스터디 ID에 해당하는 멤버 수 계산
    const memberCount = studyUsers.filter((user) => user.PK.S === studyId).length;

    return { name: studyName, value: memberCount };
  });

  return participation;
};

const StudyPerformanceDashboard = ({teamId}) => {
  const [studies, setStudies] = useState([]);
  const [studyUsers, setStudyUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studiesData = await fetchStudiesData(teamId);
        const studyUsersData = await fetchStudyUsersData();

        setStudies(studiesData);
        setStudyUsers(studyUsersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // 스터디별 참여 데이터 계산
  const participationData = calculateStudyParticipation(studies, studyUsers);

  // 원형 그래프 옵션
  const option = {
    title: {
      text: "스터디별 연구 성과 분석",
      subtext: "참여 멤버 수 기준",
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
        name: "스터디 참여율",
        type: "pie",
        radius: "30%",
        data: participationData,
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

  return (
    <div  style={{ height: '40vh'}} >
      <ReactECharts option={option} style={{ height: "40vh", width: "100%" }} />
    </div>
  );
};

export default StudyPerformanceDashboard;
