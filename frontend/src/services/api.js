import axios from 'axios';

const api = axios.create({
         baseURL: '/api/', // Your API base URL
     });

api.interceptors.request.use(
         (config) => {
             const token = localStorage.getItem('authToken');
             if (token) {
                 config.headers.Authorization = `Token ${token}`; // Or 'Bearer ' for JWT
             }
             return config;
         },
         (error) => {
             return Promise.reject(error);
         }
     );

export default api;