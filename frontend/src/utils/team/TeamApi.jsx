import axios from "axios";
import { getTeamApi, getUserApi } from "../apiConfig.js";

// Axios 인스턴스 생성
const TeamApi = axios.create({
  baseURL: getTeamApi(),
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  },
});

// 팀 ID 및 이름 가져오기
export const getTeamIdsAndNames = async () => {
  const response = await TeamApi.get("/get");
  return response.data.body || []; // team IDs
};

// 팀 프로필 가져오기
export const getTeamProfiles = async (teamIds) => {
  const profiles = await Promise.all(
    teamIds.map(async (id) => {
      const response = await TeamApi.get(`/${encodeURIComponent(id)}`);
      const profile = response.data.body;
      return typeof profile === "string" ? JSON.parse(profile) : profile;
    })
  );
  return profiles||[];
};

// 모든 팀 데이터 가져오기
// export const fetchAllTeams = async () => {
  // const teamIds = await getTeamIdsAndNames();
  // const teamProfiles = await getTeamProfiles(teamIds)
  // const sortedTeams = teamProfiles.sort((a, b) =>
  //   a.teamName.localeCompare(b.teamName)
  // );
  // return sortedTeams||[];
// };

// 팀 역할 확인
export const checkTeamRole = async (teamId) => {
  const response = await TeamApi.get(`/${encodeURIComponent(teamId)}/role`);
  return response.data.body; // 팀 역할 정보 반환
};

// 팀 이름 중복 확인
export const checkTeamNameAvailability = async (teamName) => {
  const response = await TeamApi.get(`/check-name/${encodeURIComponent(teamName)}`);
  return response.data; // { isAvailable, message } 형식으로 반환
};

// 팀 정보 업데이트
export const updateTeamInfo = async (teamId, teamData) => {
  const response = await TeamApi.put(
    `/${encodeURIComponent(teamId)}/settings/info`,
    teamData
  );
  return response.data.body; // 업데이트된 팀 데이터 반환
};

// 팀 삭제
export const deleteTeam = async (teamId) => {
  await TeamApi.delete(`/${encodeURIComponent(teamId)}/settings`);
};

// 팀 생성
export const createTeam = async (teamData) => {
  const response = await TeamApi.post('/create', teamData);
  return JSON.parse(response.data.body); // 생성된 팀 정보 반환
};

// 이메일 가져오기
export const getUserEmail = async () => {
  const response = await TeamApi.get(`${getUserApi()}/get-email`);
  console.log(`getUserEmail: ${JSON.stringify(response.data)}`);
  return response.data.email; // 사용자 이메일 반환
};

// 팀원 목록 가져오기
export const fetchTeamUsers = async (teamId) => {
  const response = await TeamApi.get(`/${encodeURIComponent(teamId)}/user`);
  return response.data.body; // 팀원 데이터 반환
};

// 팀원 추가
export const addTeamMember = async (teamId, newUser) => {
  await TeamApi.put(`/${encodeURIComponent(teamId)}/setting/users`, {
    membersToAdd: [newUser],
    membersToDelete: [],
  });
};

// 팀원 삭제
export const deleteTeamMember = async (teamId, userId) => {
  await TeamApi.put(`/${encodeURIComponent(teamId)}/setting/users`, {
    membersToAdd: [],
    membersToDelete: [userId],
  });
};