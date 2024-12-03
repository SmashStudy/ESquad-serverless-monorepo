import axios from "axios";
import { getTeamApi } from "../apiConfig.js";

// Axios 인스턴스 생성
const studyApi = axios.create({
  baseURL: getTeamApi(),
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  },
});

// 스터디 생성
export const createTeam = async (teamId, bookDto, studyData) => {
  const response = await studyApi.post(`${teamId}/study/create`, bookDto, studyData);
  return JSON.parse(response.data.body); // 생성된 팀 정보 반환
};
