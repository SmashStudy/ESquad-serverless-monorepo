import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
      setIsUsernameChecked(false); // 아이디가 변경되면 중복 확인 상태 초기화
    } else if (id === 'nickname') {
      setIsNicknameChecked(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    // 비밀번호 유효성 검사
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    if (!passwordRegex.test(value)) {
      setPasswordError('비밀번호는 8~16자이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
    } else if (formData.confirmPassword && value !== formData.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, confirmPassword: value }));

    if (formData.password && value !== formData.password) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, username: value }));

    // 아이디 유효성 검사
    const usernameRegex = /^[a-zA-Z]{8,12}$/;
    if (!usernameRegex.test(value)) {
      setUsernameError('아이디는 영문자만 사용하며 8~12자여야 합니다.');
    } else {
      setUsernameError('');
    }
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, nickname: value }));

    // 닉네임 유효성 검사
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
        params: { username: formData.username }, // 쿼리 파라미터로 전달
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
        params: { nickname: formData.nickname }, // 쿼리 파라미터로 전달
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
    if (nicknameError) {
      alert('닉네임을 확인하세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // 유효성 검사를 통과하지 못하면 폼 제출을 중단
    }

    try {
      const response = await axios.post('/api/users', formData);
      setSubmitMessage(response.data);
      alert('회원가입이 성공적으로 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      console.error('회원가입 에러:', error);
      setSubmitMessage('회원가입 실패: 서버 오류');
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
      <div className='bg-white px-6 py-8 rounded-3xl border-2 border-gray-200 shadow-lg w-full max-w-xl overflow-y-auto'
           style={{ maxHeight: '100vh' }}>
        <h2 className='text-3xl font-semibold mb-6'>회원가입</h2>
        <form className='flex flex-col gap-y-4' onSubmit={handleSubmit}>
          {/* 아이디 입력 필드 및 중복 확인 버튼 */}
          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='username' className='text-base font-semibold block text-left'>
                아이디
              </label>
              <div className='flex'>
                <input
                    type='text'
                    id='username'
                    className='flex-1 border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                    placeholder='아이디를 입력하세요'
                    value={formData.username}
                    onChange={handleUsernameChange}
                />
                <button
                    type='button'
                    onClick={handleUsernameCheck}
                    className='ml-2 py-1 px-4 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition duration-300'>
                  중복확인
                </button>
              </div>
              {usernameError && <div className='text-red-500 text-sm mt-1'>{usernameError}</div>}
            </div>
          </div>

          <div className='flex-1 min-w-[180px]'>
            <label htmlFor='nickname' className='text-base font-semibold block text-left'>
              닉네임
            </label>
            <div className='flex'>
              <input
                  type='text'
                  id='nickname'
                  className='flex-1 border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  placeholder='닉네임을 입력하세요'
                  value={formData.nickname}
                  onChange={handleNicknameChange}
              />
              <button
                  type='button'
                  onClick={handleNicknameCheck}
                  className='ml-2 py-1 px-4 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition duration-300'>
                중복확인
              </button>
            </div>
            {nicknameError && <div className='text-red-500 text-sm mt-1'>{nicknameError}</div>}
          </div>

          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='email' className='text-base font-semibold block text-left'>
                이메일
              </label>
              <input
                  type='email'
                  id='email'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  placeholder='이메일을 입력하세요'
                  value={formData.email}
                  onChange={handleInputChange}
              />
            </div>
          </div>


          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='password' className='text-base font-semibold block text-left'>
                비밀번호
              </label>
              <input
                  type='password'
                  id='password'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  placeholder='비밀번호를 입력하세요'
                  value={formData.password}
                  onChange={handlePasswordChange}
              />
            </div>
            <div className='flex-1 min-w-[100px]'>
              <label htmlFor='confirmPassword' className='text-base font-semibold block text-left'>
                비밀번호 재확인
              </label>
              <input
                  type='password'
                  id='confirmPassword'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  placeholder='비밀번호를 재확인하세요'
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
              />
            </div>
          </div>

          {passwordError && <div className='text-red-500 text-sm mt-1'>{passwordError}</div>}


          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='phoneNumber' className='text-base font-semibold block text-left'>
                연락처
              </label>
              <input
                  type='text'
                  id='phoneNumber'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  placeholder='연락처를 입력하세요'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
              />
            </div>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='birthDay' className='text-base font-semibold block text-left'>
                생년월일
              </label>
              <input
                  type='date'
                  id='birthDay'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  value={formData.birthDay}
                  onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Address fields */}
          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='postcode' className='text-base font-semibold block text-left'>
                우편번호
              </label>
              <input
                  type='text'
                  id='postcode'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  value={postcode}
                  readOnly
              />
            </div>
            <div className='flex-1 min-w-[180px] flex items-end'>
              <button
                  type='button'
                  onClick={execDaumPostcode}
                  className='py-2 px-4 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition duration-300 w-full'
              >
                주소 검색
              </button>
            </div>
          </div>

          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='address' className='text-base font-semibold block text-left'>
                주소
              </label>
              <input
                  type='text'
                  id='address'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  value={address}
                  readOnly
              />
            </div>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='extraAddress' className='text-base font-semibold block text-left'>
                참고항목
              </label>
              <input
                  type='text'
                  id='extraAddress'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  value={extraAddress}
                  readOnly
              />
            </div>
          </div>

          <div className='flex flex-wrap gap-x-4 gap-y-4'>
            <div className='flex-1 min-w-[180px]'>
              <label htmlFor='detailAddress' className='text-base font-semibold block text-left'>
                상세주소
              </label>
              <input
                  type='text'
                  id='detailAddress'
                  className='w-full border-2 border-gray-100 rounded-xl p-3 mt-1 bg-transparent'
                  value={detailAddress}
                  onChange={(e) => {
                    setDetailAddress(e.target.value);
                    setFormData((prev) => ({...prev, detailAddress: e.target.value}));
                  }}
                  placeholder='상세주소를 입력하세요'
              />
            </div>
          </div>

          <div className='flex mt-8'>
            <button
                type='submit'
                className='w-full py-3 rounded-xl bg-violet-500 text-white text-lg font-bold hover:bg-violet-600 transition duration-300'>
              회원가입
            </button>
          </div>
        </form>

        {/* {submitMessage && <div className='mt-4 text-center text-lg font-semibold'>{submitMessage}</div>} */}

        <div className='mt-8 flex justify-center items-center'>
          <p className='font-semibold text-base'>이미 계정이 있으신가요?</p>
          <Link to="/login">
            <button className='text-violet-500 text-base font-bold ml-2'>로그인하러 가기</button>
          </Link>
        </div>
      </div>
  );
};

export default JoinForm;
