import { useCallback } from 'react';
import axios from 'axios';
import {getStorageApi} from "../../utils/apiConfig.js";

const usePresignedUrl = () => {
  const storageApi = getStorageApi();

  const requestPresignedUrl = useCallback(
      async (action, fileOrKey) => {

        // 'putObject'일 때 파일 정보 포함
        const payload =
            action === 'putObject' || 'getObject'
                ? {
                  action,
                  fileKey: `files/${fileOrKey.name}`, // unique file key
                  contentType: fileOrKey.type, // MIME type
                }
                : {
                  action,
                  fileKey: fileOrKey, // 단순 키 전달
                };

        const response = await axios.post(
            `${storageApi}/presigned-url`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data.presignedUrl; // presigned URL 반환
      }
  );

  return { requestPresignedUrl };
};

export default usePresignedUrl;
