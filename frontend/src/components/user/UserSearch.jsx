import React, { useState } from 'react';
import { UserByEmail } from './UserByEmail';

const UserSearch = () => {
  const [email, setEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      setError('');
      const user = await UserByEmail(email);
      setUserData(user);
    } catch (err) {
      setError(err.message || '사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1>사용자 정보 검색</h1>
      <input
        type="email"
        placeholder="이메일 입력"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userData && (
        <div>
          <h2>사용자 정보</h2>
          <p>이메일: {userData.email}</p>
          <p>이름: {userData.name}</p>
          <p>닉네임: {userData.nickname}</p>
          <p>가입일: {userData.createdAt}</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
