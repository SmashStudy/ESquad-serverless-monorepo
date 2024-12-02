import axios from 'axios';
import {getStorageApi, getUserApi} from "../apiConfig.js";
import {getFormattedDate} from "../fileFormatUtils.js";
import {getMimeType} from "./getMimeType.js";

const storageApi = getStorageApi();
const userApi = getUserApi();

export const fetchFiles = async (targetId, targetType, limit = 5,
    currentPage = 1,
    lastEvaluatedKeys = null, setUploadedFiles = () => {
    }, setLastEvaluatedKeys = () => {
    }, setTotalPages = () => {
    }, totalPages = 1,
    setSnackbar = () => {
    }, setIsLoading = () => {
    }) => {
  try {
    setIsLoading(true);
    const lastEvaluatedKey = lastEvaluatedKeys[currentPage - 1];
    const response = await axios.get(`${storageApi}/metadata`, {
      params: {
        targetId: targetId,
        targetType: targetType,
        limit: limit,
        lastEvaluatedKey: lastEvaluatedKey || undefined,
      },
    });

    setUploadedFiles(response.data.items);

    setLastEvaluatedKeys((prevKeys) => {
      const newKeys = [...prevKeys];
      if (response.data.lastEvaluatedKey) {
        newKeys[currentPage] = response.data.lastEvaluatedKey;
      } else if (currentPage < totalPages) {
        newKeys[currentPage] = null;
      }
      return newKeys;
    });

    if (response.data.lastEvaluatedKey) {
      setTotalPages(currentPage + 1);
    } else {
      setTotalPages(currentPage);
    }
  } catch (error) {
    setSnackbar(
        {severity: 'error', message: '파일 정보를 가져오는데 실패했습니다.', open: true});
    console.error('Failed to fetch files:', error);
  } finally {
    setIsLoading(false);
  }
};

export const fetchUserEmail = async (setEmail) => {
  const token = localStorage.getItem('jwtToken');
  try {
    const response = await axios.get(`${userApi}/get-email`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setEmail(response.data.email);
  } catch (error) {
    console.error('Error fetching email:', error);
  }
};

export const handleFileUpload = async (
    selectedFile,
    email,
    targetId,
    targetType,
    setIsUploading,
    setSnackbar = () => {
    },
    setUploadedFiles = () => {
    },
    setSelectedFile = () => {
    },
    fetchFiles = () => {
    },
    setCurrentPage = () => {
    },
    setUploadProgress = () => {
    }
) => {
  if (!selectedFile) {
    return;
  }
  setIsUploading(true);
  setSnackbar({severity: 'info', message: '파일 업로드 중...', open: true});

  try {
    const userResponse = await axios.post(`${userApi}/get-user`, {email});
    const nickname = userResponse.data.nickname || 'Unknown';

    const response = await axios.post(
        `${storageApi}/upload-file`,
        {
          originalFileName: encodeURIComponent(selectedFile.name),
          targetId,
          targetType,
          userEmail: email,
          userNickname: nickname,
          fileSize: selectedFile.size,
          contentType: getMimeType(selectedFile.name),
          actualType: selectedFile.type,
          createdAt: getFormattedDate(),
        },
        {headers: {'Content-Type': 'application/json'}}
    );

    await axios.put(response.data.presignedUrl, selectedFile, {
      headers: {'Content-Type': selectedFile.type},
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentComplete = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress({
            fileName: selectedFile.name, percent: percentComplete
          });
        }
      },
    });

    setSelectedFile(null);
    setSnackbar({severity: 'success', message: '파일 업로드 완료', open: true});
    setUploadProgress({fileName: selectedFile.name, percent: 100});
    setTimeout(() => {
      setUploadProgress(null);
    })
    setCurrentPage(1);
    fetchFiles();
  } catch (error) {
    console.error('Failed to upload file:', error);
    setSnackbar({severity: 'error', message: '파일 업로드 실패', open: true});
  } finally {
    setIsUploading(false);
  }
};

export const handleFileDelete = async (fileKey, userEmail, email,
    setSnackbar = () => {
    }, setUploadedFiles = () => {
    }, fetchFiles = () => {
    },
    setCurrentPage = () => {
    }) => {
  if (email !== userEmail) {
    setSnackbar({severity: 'error', message: '업로더만 삭제할 수 있습니다.', open: true});
    return;
  }
  try {
    setSnackbar({severity: 'info', message: '파일 삭제 중...', open: true});
    const presignedResponse = await axios.delete(
        `${storageApi}/${encodeURIComponent(fileKey)}`);
    await axios.delete(presignedResponse.data.presignedUrl);
    setUploadedFiles(
        (prevFiles) => prevFiles.filter((file) => file.fileKey !== fileKey));
    setSnackbar({severity: 'success', message: '파일 삭제 완료', open: true});
    setCurrentPage(1);
    fetchFiles();
  } catch (error) {
    setSnackbar({severity: 'error', message: '파일 삭제 실패', open: true});
    console.error('Failed to delete file:', error);
  }
};

export const handleFileDownload = async (fileKey, originalFileName,
    setSnackbar = () => {
    }, setDownloadProgress = () => {
    }) => {
  try {
    setSnackbar({severity: 'info', message: '파일 다운로드 중...', open: true});
    const presignedResponse = await axios.patch(
        `${storageApi}/metadata/${encodeURIComponent(fileKey)}`, {
          updateType: 'incrementDownloadCount'
        });

    const presignedUrl = presignedResponse.data.presignedUrl;
    const downloadResponse = await axios.get(presignedUrl, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const percentComplete = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100);
          setDownloadProgress(
              {fileName: originalFileName, percent: percentComplete}); // 다운로드 진행률 업데이트
        }
      }
    });
    const blob = new Blob([downloadResponse.data], {
      type: downloadResponse.headers['content-type'],
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFileName || fileKey;
    document.body.appendChild(link);
    try {
      link.click();
    } catch (error) {
      console.error('Failed to initiate download:', error);
    } finally {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }

    setSnackbar({open: true, message: '파일 다운로드 성공', severity: 'success'});
    setTimeout(() => {
      setDownloadProgress(null);
    }, 1000);

  } catch (error) {
    setSnackbar({severity: 'error', message: '파일 다운로드 실패', open: true});
    console.error('Failed to download file:', error);
  }
};
