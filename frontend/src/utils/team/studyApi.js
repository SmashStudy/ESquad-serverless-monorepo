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
export const createStudy = async (teamId, bookDto, studyData) => {
  const response = await studyApi.post(`${teamId}/study/create`, bookDto, studyData);
  return JSON.parse(response.data.body)
};

// 스터디 목록 조회
export const getStudyList = async (teamId) => {
  const response = await studyApi.get(`${teamId}/study/get`);
  return response.data; 
};