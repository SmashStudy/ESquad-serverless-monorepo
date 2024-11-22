// 팀 유저 핸들러 로직

import { createResponse } from '../utils/responseHelper.mjs';
import * as TeamUserService from '../services/teamUserService.mjs';

/**
 * 유저가 소속된 모든 팀 조회 핸들러
 * - 인증된 유저의 모든 팀 목록을 조회
 */
export const getTeams = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub || 'USER#123';
        const teams = await TeamUserService.getTeams(userId);
        return createResponse(200, { message: 'User to Team List successfully', data: teams });
    } catch (error) {
        console.error('Error retrieving teams:', error);
        return createResponse(500, { error: `Error retrieving teams ${error.message}` });
    }
};

/**
 * 유저 권한 확인 핸들러
 */
export const checkTeamUserRole = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub || 'USER#123';
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        if (!teamId || !userId) {
            return createResponse(400, { error: 'teamId와 userId는 필수입니다.' });
        }
        const isManager = await TeamUserService.checkTeamUserRole(teamId, userId);
        return createResponse(200, { message: 'User to role successfully', data: isManager });
    } catch (error) {
        console.error('Error checking role:', error);
        return createResponse(500, { error: error.message });
    }
};

/**
 * 크루 프로필 조회 핸들러
 * - 특정 팀의 크루 프로필 정보를 조회
 */
export const getTeamUsersProfile = async (event) => {
    try {
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        const teamUsersProfiles = await TeamUserService.getTeamUsersProfile(teamId);
        return createResponse(200, { message: 'Team to User successfully', data: teamUsersProfiles });
    } catch (error) {
        console.error('Error retrieving crew profile:', error);
        return createResponse(500, { error: `Error retrieving crew profile: ${error.message}` });
    }
};

/**
 * 팀에 멤버 업데이트 서비스
 */
export const updateTeamUsers = async (event) => {
    try {
        const teamId = decodeURIComponent(event.pathParameters.teamId);
        const { membersToAdd, membersToDelete } = JSON.parse(event.body);

        // 멤버 추가
        if (membersToAdd?.length > 0) {
            await TeamUserService.addTeamUsers(teamId, membersToAdd);
        }

        // 멤버 삭제
        if (membersToDelete?.length > 0) {
            await TeamUserService.deleteTeamUsers(teamId, membersToDelete);
        }

        return createResponse(200, { message: '팀 설정이 완료되었습니다.' });
    } catch (error) {
        console.error('Error updating team members:', error);
        return createResponse(500, { error: error.message });
    }
};