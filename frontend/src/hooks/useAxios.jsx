import { useState, useEffect } from 'react';
import axios from 'axios';

const useAxios = ({ url, method = 'GET', body = null, headers = {} }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwt');
            const authHeaders = token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
            const response = await axios({
                url,
                method,
                headers: authHeaders,
                data: body,
            });
            setData(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (method === 'GET' && url) {
            fetchData();
        }
    }, [url, method]);

    return { data, error, loading, refetch: fetchData };
};

export default useAxios;
