import { io } from 'socket.io-client';

// если бек на том же домене/порте-прокси:
export const socket = io('/', { withCredentials: true });

// если отдельный домен/порт:
// export const socket = io('http://localhost:5555', { withCredentials: true });
