import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Container,
  Typography,
  Grid,
  Box
} from '@mui/material';

const JoinForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: '',
    birthDay: '',
    address: '',
    postcode: '',
    detailAddress: '',
    extraAddress: '',
    nickname: '',
  });

  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleComplete = (data) => {
    let addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
    let extraAddr = '';

    if (data.userSelectedType === 'R') {
      if (data.bname && /[동|로|가]$/g.test(data.bname)) {
        extraAddr += data.bname;
      }
      if (data.buildingName && data.apartment === 'Y') {
        extraAddr += extraAddr ? `, ${data.buildingName}` : data.buildingName;
      }
      if (extraAddr) {
        extraAddr = ` (${extraAddr})`;
      }
    }

    setPostcode(data.zonecode);
    setAddress(addr);
    setExtraAddress(extraAddr);
    setFormData((prev) => ({ ...prev, address: addr, postcode: data.zonecode, extraAddress: extraAddr }));
    const detailAddressElement = document.getElementById('address2');
    if (detailAddressElement) {
      detailAddressElement.focus();
    }
  };

  const execDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: handleComplete,
    }).open();
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === 'username') {
      setIsUsernameChecked(false);
    } else if (id === 'nickname') {
      setIsNicknameChecked(false);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!~&+@])[a-z\d!~&+@]{6,16}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    if (!validatePassword(value)) {
      setPasswordError('비밀번호는 6~16자이며, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    } else if (formData.confirmPassword && value !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, confirmPassword: value }));

    if (!validatePassword(formData.password)) {
      setPasswordError('비밀번호가 규칙에 맞지 않습니다.');
    } else if (value !== formData.password) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, username: value }));

    const usernameRegex = /^[a-zA-Z0-9]{6,12}$/;
    if (!usernameRegex.test(value)) {
      setUsernameError('아이디는 영어와 숫자로 구성된 6~12자여야 합니다.');
    } else {
      setUsernameError('');
    }
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, nickname: value }));

    if (value.length < 2 || value.length > 16) {
      setNicknameError('닉네임은 2~16자 사이여야 합니다.');
    } else {
      setNicknameError('');
    }
  };

  const handleUsernameCheck = async () => {
    if (usernameError || !formData.username.trim()) {
      alert('유효한 아이디를 입력하세요.');
      return;
    }

    try {
      const response = await axios.get('/api/users/usernamecheck', {
        params: { username: formData.username },
      });
      if (response.data.available) {
        alert('사용 가능한 아이디입니다.');
        setIsUsernameChecked(true);
      } else {
        alert('이미 사용 중인 아이디입니다.');
        setIsUsernameChecked(false);
      }
    } catch (error) {
      console.error('아이디 중복 확인 에러:', error);
      alert('아이디 중복 확인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleNicknameCheck = async () => {
    if (nicknameError || !formData.nickname.trim()) {
      alert('유효한 닉네임을 입력하세요.');
      return;
    }

    try {
      const response = await axios.get('/api/users/usernicknamecheck', {
        params: { nickname: formData.nickname },
      });
      if (response.data.available) {
        alert('사용 가능한 닉네임입니다.');
        setIsNicknameChecked(true);
      } else {
        alert('이미 사용 중인 닉네임입니다.');
        setIsNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복 확인 에러:', error);
      alert('닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const validateForm = () => {
    if (!formData.username.trim() || usernameError) {
      alert('아이디를 확인하세요.');
      return false;
    }
    if (!isUsernameChecked) {
      alert('아이디 중복확인을 해주세요.');
      return false;
    }
    if (!formData.nickname.trim() || nicknameError) {
      alert('닉네임을 확인하세요.');
      return false;
    }
    if (!isNicknameChecked) {
      alert('닉네임 중복확인을 해주세요.');
      return false;
    }
    if (!formData.password.trim() || passwordError) {
      alert('비밀번호를 확인하세요.');
      return false;
    }
    if (!formData.confirmPassword.trim() || formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (!formData.email.trim()) {
      alert('이메일을 입력하세요.');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      alert('연락처를 입력하세요.');
      return false;
    }
    if (!formData.birthDay.trim()) {
      alert('생년월일을 입력하세요.');
      return false;
    }
    if (!formData.address.trim() || !formData.postcode.trim() || !formData.detailAddress.trim()) {
      alert('주소를 완전히 입력하세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  return (
      <Container maxWidth="md">
        <Box sx={{ p: 5, bgcolor: 'white', borderRadius: 2, boxShadow: 3, maxWidth: 800, margin: '0 auto' }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center">
            회원가입
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                    fullWidth
                    id="username"
                    label="아이디"
                    value={formData.username}
                    onChange={handleUsernameChange}
                    error={!!usernameError}
                    helperText={usernameError}
                />
              </Grid>
              <Grid item xs={12} sm={4} display="flex" alignItems="center" justifyContent="center">
                <Button
                    variant="contained"
                    onClick={handleUsernameCheck}
                    fullWidth
                    sx={{ height: '100%' }}
                >
                  중복확인
                </Button>
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                    fullWidth
                    id="nickname"
                    label="닉네임"
                    value={formData.nickname}
                    onChange={handleNicknameChange}
                    error={!!nicknameError}
                    helperText={nicknameError}
                />
              </Grid>
              <Grid item xs={12} sm={4} display="flex" alignItems="center" justifyContent="center">
                <Button
                    variant="contained"
                    onClick={handleNicknameCheck}
                    fullWidth
                    sx={{ height: '100%' }}
                >
                  닉네임 중복확인
                </Button>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="password"
                    label="비밀번호"
                    type="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="confirmPassword"
                    label="비밀번호 재확인"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    error={!!passwordError}
                    helperText={passwordError}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="email"
                    label="이메일"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="phoneNumber"
                    label="연락처"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    id="birthDay"
                    label="생년월일"
                    type="date"
                    value={formData.birthDay}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                    fullWidth
                    id="postcode"
                    label="우편번호"
                    value={postcode}
                    InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4} display="flex" alignItems="center" justifyContent="center">
                <Button
                    variant="contained"
                    onClick={execDaumPostcode}
                    fullWidth
                    sx={{ height: '100%' }}
                >
                  주소 검색
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="address"
                    label="주소"
                    value={address}
                    InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="extraAddress"
                    label="참고항목"
                    value={extraAddress}
                    InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    fullWidth
                    id="detailAddress"
                    label="상세주소"
                    value={detailAddress}
                    onChange={(e) => {
                      setDetailAddress(e.target.value);
                      setFormData((prev) => ({ ...prev, detailAddress: e.target.value }));
                    }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ py: 2, bgcolor: 'primary.main' }}
                >
                  회원가입
                </Button>
              </Grid>
            </Grid>
          </form>
          <Box mt={5} textAlign="center">
            <Typography variant="body1">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" style={{ color: '#3f51b5', fontWeight: 'bold' }}>
                로그인하러 가기
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
  );
};

export default JoinForm;