import React, { useEffect, useState } from 'react';
import { initializeCognitoConfig, getCognitoConfig } from './Config.js';

const Environment = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await initializeCognitoConfig(); // 환경 변수 초기화
        const cognitoConfig = getCognitoConfig(); // 초기화된 환경 변수 가져오기
        setConfig(cognitoConfig);
      } catch (error) {
        console.error('환경 변수 로드 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <div>
      <h1>Cognito Config</h1>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
};

export default Environment;
