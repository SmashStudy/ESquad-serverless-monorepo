// 팀원 유효성 검사 로직

import { validateTeamId } from './teamValidator.mjs';

/**
 * 유저 EMAIL 유효성 검사
 * - 유저 EMAIL가 올바른지 확인
 */
export const validateTeamUserId = (userEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 정규식

    if (!userEmail) {
        return { isValid: false, message: 'userEmail는 필수입니다.' };
    }
    
    if (typeof userEmail !== 'string' || !emailRegex.test(userEmail) || userEmail.trim().length === 0) {
        return { isValid: false, message: '유효하지 않은 이메일 형식입니다.' };
    }
    if (!emailRegex.test(userEmail)) {
        return { isValid: false, message: '유저 EMAIL 형식이 아닙니다.' };
    }
    return { isValid: true, message: '유저 EMAIL 유효성 검사 완' };
};

/**
 * 유저 EMAIL 목록 유효성 검사
 * - 팀원 배열의 길이 및 중복 여부를 검사
 * - 유저 EMAIL 목록이 배열인지, 비어있지 않은지, 각 항목이 문자열인지 확인
 */
export const validateTeamUserIds = (teamId, userEmails) => {

    if (!validateTeamId(teamId).isValid){
        return { isValid: false, message: 'req가 잘못되었습니다.' };
    }
    userEmails.forEach(userEmail => {
        if(!validateTeamUserId(userEmails).isValid) 
            return { isValid: false, message: 'req가 잘못되었습니다.' };
    });
     
    if (!Array.isArray(userEmails) || userEmails.length === 0) {
        return { isValid: false, message: '유저 EMAIL 목록이 비어 있거나 잘못된 형식입니다.' };
    }

    const uniqueEmails = new Set(userEmails);
    if (uniqueEmails.size !== userEmails.length) {
        return { isValid: false, message: '중복된 팀원 EMAIL가 있습니다.' };
    }

    return { isValid: true, message: '유저 EMAIL 목록 유효성 검사 완' };
};

/**
 * 유저 권한 유효성 검사
 * - 팀과 유저 유효성 검사
 */
export const validateRoleCheckData = (teamId, userEmail) => {
    
    if (!validateTeamId(teamId).isValid){
        return { isValid: false, message: 'teamId가 잘못되었습니다.1' };
    }
    
    if (!validateTeamUserId(userEmail).isValid){
        console.log(userEmail)
        return { isValid: false, message: 'userEmail가 잘못되었습니다.2' };
    }
    return  {isValid: true, message:`${userEmail}유저 권한 유효성 검사 완`};
};