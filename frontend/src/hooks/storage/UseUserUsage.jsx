import { useState, useEffect } from 'react';
import axios from 'axios';
import { getStorageApi } from '../../utils/apiConfig';

const useUserUsage = (email) => {
  const [usage, setUsage] = useState(null); // Total file size in bytes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email) return;

    const fetchUsage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${getStorageApi()}/get-user-usage`, {
          params: { userEmail: email },
        });
        const totalUsage = response.data.reduce(
            (acc, item) => acc + (item.fileSize || 0),
            0
        ); // Sum up fileSize
        setUsage(totalUsage);
        setError(null);
      } catch (err) {
        console.error('Error fetching user usage:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [email]);

  return { usage, loading, error };
};

export default useUserUsage;
