import {TeamApi} from "./TeamApi.jsx";

/** 팀조회 API */
export const fetchTeam = async () => {
    const apiInstance = TeamApi();
    const response = await apiInstance.get(`/api/teams`);
    return response.data;
}