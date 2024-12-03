import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserApi } from "../../utils/apiConfig.js";

const UserContext = createContext();

// UserProvider를 통해 Context 제공
export const UserNicknameProvider = ({ children }) => {
  const [nickname, setNickname] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNickname = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("JWT 토큰이 없습니다.");
      }

      const response = await fetch(`${getUserApi()}/get-nickname`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("닉네임 정보를 가져오지 못했습니다.");
      }

      const data = await response.json();
      setNickname(data.nickname);
      setLoading(false);
    } catch (err) {
      console.error("닉네임 가져오기 중 오류:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNickname();
  }, []);

  return (
    <UserContext.Provider value={{ nickname, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

// UserContext를 쉽게 사용할 수 있는 커스텀 훅
export const useUser = () => useContext(UserContext);
