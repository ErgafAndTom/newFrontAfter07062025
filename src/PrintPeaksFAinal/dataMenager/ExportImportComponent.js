import React from 'react';
import axios from '../../api/axiosInstance';

const ExportImportComponent = () => {
    // Функція для експорту даних
    const handleExport = async () => {
        try {
            const response = await axios.get('/db/export-data', {
                responseType: 'blob'
            });
            // Створюємо посилання для завантаження архіву
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'database_backup.zip');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Помилка експорту', error);
        }
    };

    // Функція для імпорту даних
    const handleImport = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('archive', file);
        try {
            const response = await axios.post('/db/import-data', formData);
            alert(response.data);
        } catch (error) {
            console.error('Помилка імпорту', error);
        }
    };

    return (
        <div>
            <button onClick={handleExport}>Експорт даних</button>
            <input type="file" onChange={handleImport} />
        </div>
    );
};

export default ExportImportComponent;
