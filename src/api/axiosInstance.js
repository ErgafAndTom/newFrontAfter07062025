import axios from 'axios';
// document.get()

const instance = axios.create({
    // baseURL: 'http://localhost:5555', // Базовий URL сервера
});

// Добавляем интерсептор для добавления токена к каждому запросу
instance.interceptors.request.use(
    (config) => {
        // eslint-disable-next-line no-undef
        const token = localStorage.getItem('token');
        // console.log(token);
        if (token) {
            config.headers['Authorization'] = token;
        }
        // console.log(config);
        return config;
    },
    (error) => {
        // eslint-disable-next-line no-undef
        return Promise.reject(error);
    }
);

export default instance;
