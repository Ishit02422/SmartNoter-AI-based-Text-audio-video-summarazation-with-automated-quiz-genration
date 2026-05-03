import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:6001', // Default backend port from server.ts
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.message?.includes("INSUFFICIENT_CREDITS")) {
            window.location.href = '/dashboard/pricing';
            // Return a never-resolving promise so the component's catch block doesn't run and show an error popup
            return new Promise(() => {});
        }
        return Promise.reject(error);
    }
);

export default api;
