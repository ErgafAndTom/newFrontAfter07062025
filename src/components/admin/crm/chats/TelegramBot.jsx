import React, { useState } from 'react';
import axios from 'axios';

const TelegramBot = () => {
    const [message, setMessage] = useState('');

    const sendMessage = async () => {
        const chatId = '150610497';
        const text = message;
        const token = '6343783861:AAHeU_rac1XQkTAeBT3hacvgZ7-c2M-pnJo';
        const url = `https://api.telegram.org/bot${token}/sendMessage`;

        try {
            await axios.post(url, {
                chat_id: chatId,
                text: text,
            });
            setMessage('');
            alert('Повідомлення відправлено!');
        } catch (error) {
            console.error('Помилка при відправці повідомлення:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Відправити</button>
        </div>
    );
};

export default TelegramBot;
