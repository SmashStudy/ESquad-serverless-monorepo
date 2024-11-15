// 팀 핸들러 로직

import { createResponse } from '../util/responseHelper.mjs';
import * as TeamService from '../service/teamService.mjs';

/**
 * 팀 생성 핸들러
 * - 요청 본문에서 팀 데이터를 받아 팀을 생성
 */
export const createTeam = async (event) => {
    try {
        const teamData = JSON.parse(event.body);
        const result = await TeamService.createTeamService(teamData);
        return createResponse(201, { message: 'Team created successfully', data: result });
    } catch (error) {
        console.error('Error creating team:', error);
        return createResponse(400, { error: `Failed to create team: ${error.message}` });
    }
};

/**
 * 팀 이름 중복 확인 핸들러
 * - 경로 매개변수에서 팀 이름을 받아 중복 여부를 확인
 */
export const checkTeamName = async (event) => {
    try {
        const teamName = decodeURIComponent(event.pathParameters.teamName);
        const isAvailable = await TeamService.checkTeamNameService(teamName);
        return createResponse(200,  { isAvailable, message: isAvailable ? 'Team name is available' : 'Team name already exists' });
    } catch (error) {
        console.error('Error checking team name:', error);
        return createResponse(500, { error: `Error checking team name  ${error.message}` });
    }
};

/**
 * 유저가 소속된 모든 팀 조회 핸들러
 * - 인증된 유저의 모든 팀 목록을 조회
 */
export const getAllTeams = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub || 'USER#123';
        const teams = await TeamService.getAllTeamsService(userId);
        return createResponse(200, { message: 'Team created successfully', data: teams });
    } catch (error) {
        console.error('Error retrieving teams:', error);
        return createResponse(500, { error: `Error retrieving teams ${error.message}` });
    }
};

/**
 * 팀 프로필 조회 핸들러
 * - 특정 팀의 프로필 정보를 조회
 */
export const getTeamProfile = async (event) => {
    try {
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        const teamProfile = await TeamService.getTeamProfileService(teamId);
        return createResponse(200, { message: 'Team created successfully', data: teamProfile});
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
        const updatedTeam = await TeamService.updateTeamService(teamId, teamData);
        return createResponse(200, { message: 'Team updated successfully', data: updatedTeam });
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
        await TeamService.deleteTeamService(teamId);
        return createResponse(200, { message: 'Team created successfully', data: teamId });
    } catch (error) {
        console.error('Error deleting team:', error);
        return createResponse(500, { error: `Error deleting team ${error.message}` });
    }
};