// 팀 유효성 검사 로직

/**
 * 팀 이름 유효성 검사
 * - 팀 이름이 비어 있거나 특정 조건을 충족하지 않으면 false 반환
 */
export const validateTeamName = (teamName) => {
    if (!teamName || typeof teamName !== 'string' || teamName.trim().length === 0) {
        return { isValid: false, message: '팀 이름을 입력해주세요.' };
    }

    // 팀 이름 길이 제한 (예: 3 ~ 50자)
    if (teamName.length < 3 || teamName.length > 50) {
        return { isValid: false, message: '팀 이름은 3자 이상, 50자 이하여야 합니다.' };
    }

    return { isValid: true, message: '' };
};

/**
 * 팀원 유효성 검사
 * - 팀원 배열의 길이 및 중복 여부를 검사
 */
export const validateTeamMembers = (userIds) => {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        return { isValid: false, message: '팀원 ID 목록이 비어 있습니다.' };
    }

    // 최소 4명, 최대 12명
    if (userIds.length < 4 || userIds.length > 12) {
        return { isValid: false, message: '팀 구성원은 최소 4명, 최대 12명이어야 합니다.' };
    }

    // 중복된 ID가 있는지 확인
    const uniqueIds = new Set(userIds);
    if (uniqueIds.size !== userIds.length) {
        return { isValid: false, message: '중복된 팀원 ID가 있습니다.' };
    }

    return { isValid: true, message: '' };
};
