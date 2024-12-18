/**
 * UUID를 생성하는 함수
 * @returns {string} - 생성된 UUID
 * @throws {Error} - UUID 생성 오류 발생 시
 */
export const uuid = () => {
  try {
    const generatedUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

    // 형식 검증 (UUID 형식이 맞는지 확인)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(generatedUuid)) {
      throw new Error('생성된 UUID가 예상된 형식과 일치하지 않습니다.');
    }

    return generatedUuid;
  } catch (error) {
    console.error('UUID 생성 중 오류 발생:', error);
    throw new Error(`UUID 생성에 실패했습니다: ${error.message}`);
  }
};
