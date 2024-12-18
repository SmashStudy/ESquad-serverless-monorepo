// 팀 핸들러 로직

import { createResponse } from '../utils/responseHelper.mjs';
import * as TeamService from '../services/teamService.mjs';

/**
 * 팀 이름 중복 확인 핸들러
 * - 경로 매개변수에서 팀 이름을 받아 중복 여부를 확인
 */
export const checkTeamName = async (event) => {
    try {
        const teamName = decodeURIComponent(event.pathParameters?.teamName);
        if (!teamName) {
            return createResponse(400, { error: '잘못된 팀명입니다!' });
        }
        const isAvailable = await TeamService.checkTeamName(teamName);
        return createResponse(200,  { isAvailable, message: isAvailable ? '사용가능한 이름입니다' : '사용할 수 없는 팀명입니다' });
    } catch (error) {
        console.error('Error checking team name:', error);
        return createResponse(500, { error: `Error checking team name  ${error.message}` });
    }
};

/**
 * 팀 생성 핸들러
 * - 요청 본문에서 팀 데이터를 받아 팀을 생성
 */
export const createTeam = async (event) => {
    try {
        const teamData = JSON.parse(event.body);
        const result = await TeamService.createTeam(teamData);
        return createResponse(201, { message: 'Team created successfully', body: JSON.stringify(result) });
    } catch (error) {
        console.error('Error creating team:', error);
        return createResponse(400, { error: `Failed to create team: ${error.message}` });
    }
};

/**
 * 팀 프로필 조회 핸들러
 * - 특정 팀의 프로필 정보를 조회
 */
export const getTeamProfile = async (event) => {
    try {
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        const teamProfile = await TeamService.getTeamProfile(teamId);
        return createResponse(200, { message: 'Team search successfully', body: teamProfile});
    } catch (error) {
        console.error('Error retrieving team profile:', error);
        return createResponse(500, { error: `Error retrieving team profile ${error.message}` });
    }
};

/**
 * 팀 수정 핸들러
 * - 팀 ID와 수정할 데이터를 받아 팀 정보를 업데이트
 */
export const updateTeam = async (event) => {
    try {
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        const teamData = JSON.parse(event.body);
        const updatedTeam = await TeamService.updateTeam(teamId, teamData);
        return createResponse(200, { message: 'Team updated successfully', body: JSON.stringify(updatedTeam) });
    } catch (error) {
        console.error('Error updating team:', error);
        return createResponse(500, { error: `Error updating team ${error.message}` });
    }
};

/**
 * 팀 삭제 핸들러
 * - 특정 팀 ID를 받아 해당 팀을 삭제
 */
export const deleteTeam = async (event) => {
    try {
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        await TeamService.deleteTeam(teamId);
        return createResponse(200, { message: 'Team deleted successfully', body: JSON.stringify(teamId) });
    } catch (error) {
        console.error('Error deleting team:', error);
        return createResponse(500, { error: `Error deleting team ${error.message}` });
    }
};