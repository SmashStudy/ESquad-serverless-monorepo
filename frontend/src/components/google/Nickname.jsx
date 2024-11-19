// UserSignup.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

function decodeJWT(token) {
  try {
    const base64Payload = token.split('.')[1];
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      )
    );
    return payload;
  } catch (error) {
    console.error('JWT 토큰 디코딩 실패', error);
    return null;
  }
}

const UserSignup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // JWT 토큰에서 userId 추출하기
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded && decoded.sub) {
        setUserId(decoded.sub); // 토큰의 sub 클레임이 userId를 포함한다고 가정
        checkUserNickname(decoded.sub);
      }
    }
  }, []);

  const checkUserNickname = async (userId) => {
    try {
      const apiUrl = `${import.meta.env.VITE_COGNITO_DOMAIN}/saveUserToDynamoDB/getUser/${userId}`;
      const response = await axios.get(apiUrl);
      if (response.data && response.data.nickname) {
        // 닉네임이 이미 존재하는 경우, 바로 페이지 이용 가능하도록 처리
        window.location.href = import.meta.env.VITE_COGNITO_LOGOUT_URI;
      } else {
        // 닉네임이 없는 경우 모달을 열도록 설정
        setOpen(true);
        setEmail(response.data.email || '');
        setName(response.data.name || '');
      }
    } catch (err) {
      console.error('사용자 데이터 가져오기 오류:', err);
      setError('사용자 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const apiUrl = `${import.meta.env.VITE_COGNITO_DOMAIN}/saveUserToDynamoDB`;
      const response = await axios.post(apiUrl, {
        userAttributes: {
          userId,
          email,
          name,
          nickname,
        },
      });

      if (response.status === 200) {
        setSuccess(true);
        setOpen(false); // 모달 닫기
        window.location.href = import.meta.env.VITE_COGNITO_LOGOUT_URI;
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          '사용자를 저장하는 중 오류가 발생했습니다.'
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    // 사용자가 모달을 닫았을 때 추가 동작을 원하면 이곳에 추가
  };

  return (
    <div className="user-signup">
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            닉네임을 설정하기
          </Typography>
          <Typography sx={{ mt: 2 }}>닉네임을 설정해주세요!</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
              required
              sx={{ mt: 2 }}
            />
            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
              닉네임 저장
            </Button>
          </form>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default UserSignup;
