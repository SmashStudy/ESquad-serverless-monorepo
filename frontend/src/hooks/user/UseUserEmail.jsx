import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {getUserApi} from "../../utils/apiConfig.js";

const useUserEmail = () => {
  const [email, setEmail] = useState('unknown');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserEmail = useCallback(async () => {
    const userApi = getUserApi(); // userApi 호출
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setError(new Error('JWT token is missing'));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${userApi}/get-email`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmail(response.data.email);
      setError(null); // Reset error on success
    } catch (err) {
      console.error('Error fetching email:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch email once on mount
  useEffect(() => {
    fetchUserEmail();
  }, [fetchUserEmail]);

  return { email, error, loading, fetchUserEmail };
};

export default useUserEmail;
