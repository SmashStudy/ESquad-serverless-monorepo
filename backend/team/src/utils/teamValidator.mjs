// 팀 유효성 검사 로직

/**
 * 팀 ID 유효성 검사
 * - 팀 ID가 유효한지 확인
 */
export const validateTeamId = (teamId) => {
    if (!teamId || typeof teamId !== 'string' || teamId.trim().length === 0) {
        return { isValid: false, message: '유효한 팀 ID를 입력해주세요.' };
    }
    return { isValid: true, message: '' };
};


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
 * 팀 설명 유효성 검사 (선택 사항)
 * - 팀 설명이 있을 경우, 길이를 제한
 */
export const validateTeamDescription = (description) => {
    if (description && typeof description !== 'string') {
        return { isValid: false, message: '팀 설명은 문자열이어야 합니다.' };
    }

    // 팀 설명 길이 제한 (예: 최대 200자)
    if (description && description.length > 200) {
        return { isValid: false, message: '팀 설명은 200자 이하여야 합니다.' };
    }

    return { isValid: true, message: '' };
};