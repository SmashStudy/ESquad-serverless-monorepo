import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import Layout from './Layout'; // Layout 컴포넌트 가져오기
import {getUserApi} from "../../utils/apiConfig.js";

const NicknameEditor = () => {
  const [nickname, setNickname] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 닉네임 가져오기 함수
  const fetchNickname = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${getUserApi()}/get-nickname`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      setNickname(response.data.nickname);
      setNewNickname(response.data.nickname);
    } catch (err) {
      setError('닉네임을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 업데이트 함수
  const updateNickname = async () => {
    const nicknameRegex = /^[가-힣a-zA-Z0-9]+$/;

    if (newNickname.trim().length < 2 || newNickname.trim().length > 10) {
      setError('닉네임은 2자 이상, 10자 이하여야 합니다.');
      return;
    }

    if (!nicknameRegex.test(newNickname)) {
      setError('닉네임은 완성된 한글, 영어, 숫자만 사용할 수 있습니다. 특수문자 및 자음/모음은 사용할 수 없습니다.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(
        `${getUserApi()}/update-nickname`,
        { nickname: newNickname },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      setSuccess('닉네임이 성공적으로 업데이트되었습니다.');
      setNickname(newNickname);
    } catch (err) {
      if (err.response?.status === 500) {
        setError('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('닉네임 업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 로드 시 닉네임 가져오기
  useEffect(() => {
    fetchNickname();
  }, []);

  return (
    <Layout>
      <Box sx={{ flexGrow: 1, padding: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              닉네임 관리
            </Typography>

            {loading && <CircularProgress />}

            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                {success}
              </Alert>
            )}

            {!loading && (
              <>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  현재 닉네임: <strong>{nickname}</strong>
                </Typography>
                <TextField
                  label="새 닉네임"
                  variant="outlined"
                  fullWidth
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={updateNickname}
                  disabled={loading}
                >
                  닉네임 업데이트
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default NicknameEditor;
