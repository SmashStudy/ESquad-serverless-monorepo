// 팀원 유효성 검사 로직

import { validateTeamId } from './teamValidator.mjs';

/**
 * 유저 ID 유효성 검사
 * - 유저 ID가 올바른지 확인
 */
export const validateTeamUserId = (userId) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 정규식
    const gmailRegex = /^[^\s@]+@gmail\.com$/; // Gmail 도메인 확인 정규식

    if (!userId) {
        return { isValid: false, message: 'userId는 필수입니다.' };
    }
    
    if (typeof userId !== 'string' || !emailRegex.test(userId) || userId.trim().length === 0) {
        return { isValid: false, message: '유효하지 않은 이메일 형식입니다.' };
    }
    if (!gmailRegex.test(userId)) {
        return { isValid: false, message: '유저 ID가 Gmail 도메인이 아닙니다.' };
    }
    return { isValid: true, message: '유저 ID 유효성 검사 완' };
};

/**
 * 유저 ID 목록 유효성 검사
 * - 팀원 배열의 길이 및 중복 여부를 검사
 * - 유저 ID 목록이 배열인지, 비어있지 않은지, 각 항목이 문자열인지 확인
 */
export const validateTeamUserIds = (teamId, userIds) => {

    if (!validateTeamId(teamId).isValid){
        return { isValid: false, message: 'req가 잘못되었습니다.' };
    }
    userIds.forEach(userId => {
        console.log("되고있음");
        
        if(!validateTeamUserId(userId).isValid) 
            return { isValid: false, message: 'req가 잘못되었습니다.' };
    });
     
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return { isValid: false, message: '유저 ID 목록이 비어 있거나 잘못된 형식입니다.' };
    }

    const uniqueIds = new Set(userIds);
    if (uniqueIds.size !== userIds.length) {
        return { isValid: false, message: '중복된 팀원 ID가 있습니다.' };
    }

    return { isValid: true, message: '유저 ID 목록 유효성 검사 완' };
};

/**
 * 유저 권한 유효성 검사
 * - 팀과 유저 유효성 검사
 */
export const validateRoleCheckData = (teamId, userId) => {
    
    if (!validateTeamId(teamId).isValid){
        return { isValid: false, message: 'req가 잘못되었습니다.1' };
    }
    
    if (!validateTeamUserId(userId).isValid){
        return { isValid: false, message: 'req가 잘못되었습니다.2' };
    }
    return  {isValid: true, message:'유저 권한 유효성 검사 완'};
};