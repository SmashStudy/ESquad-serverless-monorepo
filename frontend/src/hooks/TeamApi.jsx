import axios from "axios";

/** CREATE CUSTOM AXIOS INSTANCE */
export const TeamApi = () => {
    const ACCESS_TOKEN = localStorage.getItem('jwt');
    return axios.create({
        baseURL: 'http://localhost:5173',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
    });
};


