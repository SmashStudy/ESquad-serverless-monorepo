import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserApi } from "../utils/apiConfig.js";

const UserContext = createContext();

export const UserEmailProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmail = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("JWT 토큰이 없습니다.");
      }

      const response = await fetch(`${getUserApi()}/get-email`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("이메일 정보를 가져오지 못했습니다.");
      }

      const data = await response.json();
      setEmail(data.email);
      setLoading(false);
    } catch (err) {
      console.error("이메일 가져오기 중 오류:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmail();
    }, 2000); // 2초 지연

    return () => clearTimeout(timer);
  }, []);

  return (
    <UserContext.Provider value={{ email, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
