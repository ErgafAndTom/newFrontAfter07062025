import httpClient from '../httpClient';

const instance = httpClient.create({});

// Интерсептор для добавления токена к каждому запросу
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
