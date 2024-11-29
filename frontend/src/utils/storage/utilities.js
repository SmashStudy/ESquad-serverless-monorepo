import axios from 'axios';
import {getStorageApi, getUserApi} from "../apiConfig.js";
import {UserByEmail} from "../../components/user/UserByEmail.jsx";
import {getFormattedDate} from "../fileFormatUtils.js";

const storageApi = getStorageApi();
const userApi = getUserApi();

export const fetchFiles = async (targetId, targetType, limit, currentPage,
    lastEvaluatedKeys, setUploadedFiles, setLastEvaluatedKeys, setTotalPages,
    setSnackbar, setIsLoading) => {
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

    const filesWithNicknames = await Promise.all(
        response.data.items.map(async (file) => {
          try {
            const user = await UserByEmail(file.userEmail);
            return {
              ...file,
              nickname: user.nickname || 'Unknown',
            };
          } catch (error) {
            return {...file, nickname: 'Unknown'};
          }
        })
    );
    setUploadedFiles(filesWithNicknames);

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

export const handleFileUpload = async (selectedFile, requestPresignedUrl, email,
    studyId, setIsUploading, setSnackbar, setUploadedFiles, setSelectedFile,
    fetchFiles, setCurrentPage) => {
  if (!selectedFile) {
    return;
  }
  setIsUploading(true);
  setSnackbar({severity: 'info', message: '파일 업로드 중...', open: true});

  try {
    const uniqueFileName = `${Date.now()}-${selectedFile.name}`;
    const presignedResponse = await requestPresignedUrl('putObject',
        uniqueFileName);

    await axios.put(presignedResponse, selectedFile, {
      headers: {'Content-Type': selectedFile.type},
    });

    const metadataResponse = await axios.post(
        `${storageApi}/store-metadata`,
        {
          fileKey: `files/${uniqueFileName}`,
          metadata: {
            targetId: studyId,
            targetType: 'STUDY_PAGE',
            userEmail: email,
            fileSize: selectedFile.size,
            extension: selectedFile.type.split('/').pop(),
            contentType: selectedFile.type,
            originalFileName: selectedFile.name,
            createdAt: getFormattedDate(),
          },
        },
        {headers: {'Content-Type': 'application/json'}}
    );

    const newFileData = metadataResponse.data.data;
    setUploadedFiles((prevFiles) => [newFileData, ...prevFiles]);
    setSelectedFile(null);
    setSnackbar({severity: 'success', message: '파일 업로드 완료', open: true});
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
    requestPresignedUrl, setSnackbar, setUploadedFiles, fetchFiles,
    setCurrentPage) => {
  if (email !== userEmail) {
    setSnackbar({severity: 'error', message: '업로더만 삭제할 수 있습니다.', open: true});
    return;
  }
  try {
    setSnackbar({severity: 'info', message: '파일 삭제 중...', open: true});
    const presignedResponse = await requestPresignedUrl('deleteObject',
        fileKey);
    await axios.delete(presignedResponse);
    await axios.delete(`${storageApi}/${encodeURIComponent(fileKey)}`);
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
    requestPresignedUrl, setSnackbar) => {
  try {
    setSnackbar({severity: 'info', message: '파일 다운로드 중...', open: true});
    const presignedResponse = await requestPresignedUrl('getObject', fileKey);
    const downloadResponse = await axios.get(presignedResponse, {
      responseType: 'blob',
    });
    const blob = new Blob([downloadResponse.data], {
      type: downloadResponse.headers['content-type'],
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFileName || fileKey;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    setSnackbar({open: true, message: '파일 다운로드 성공', severity: 'success'});
  } catch (error) {
    setSnackbar({severity: 'error', message: '파일 다운로드 실패', open: true});
    console.error('Failed to download file:', error);
  }
};
