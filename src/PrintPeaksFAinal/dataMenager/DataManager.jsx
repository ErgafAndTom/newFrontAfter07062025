// src/DataManager.js
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { saveAs } from 'file-saver';

const DataManager = () => {
    const [databases, setDatabases] = useState({});
    const [selectedSchema, setSelectedSchema] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        // Получение списка баз данных, схем и таблиц
        axios.post('/db/databases')
            .then(response => {
                // console.log(response.data);
                setDatabases(response.data);
                const firstSchema = Object.keys(response.data)[0];
                setSelectedSchema(firstSchema);
                const firstTable = response.data[firstSchema][0];
                setSelectedTable(firstTable);
            })
            .catch(error => {
                console.error('Ошибка при получении баз данных:', error);
            });
    }, []);

    const handleExport = () => {
        if (!selectedSchema || !selectedTable) {
            alert('Выберите схему и таблицу для экспорта.');
            return;
        }

        axios({
            url: '/db/export-excel',
            method: 'POST',
            params: {
                schema: selectedSchema,
                table: selectedTable
            },
            responseType: 'blob',
        })
            .then((response) => {
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `${selectedTable}.xlsx`);
            })
            .catch((error) => {
                console.error('Ошибка при экспорте:', error);
                alert('Не удалось экспортировать данные.');
            });
    };

    const handleImport = () => {
        if (!selectedSchema || !selectedTable) {
            alert('Выберите схему и таблицу для импорта.');
            return;
        }

        if (!file) {
            alert('Выберите файл для импорта.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('schema', selectedSchema);
        formData.append('table', selectedTable);

        axios.post('/db/import-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                alert(response.data);
            })
            .catch(error => {
                console.error('Ошибка при импорте:', error);
                alert('Не удалось импортировать данные.');
            });
    };

    const handleSchemaChange = (e) => {
        const schema = e.target.value;
        setSelectedSchema(schema);
        const tables = databases[schema];
        setSelectedTable(tables[0]);
    };

    const handleTableChange = (e) => {
        setSelectedTable(e.target.value);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <div>
            <h1>Управление данными</h1>

            <div>
                <label>Схема:</label>
                <select value={selectedSchema} onChange={handleSchemaChange}>
                    {Object.keys(databases).map((schema) => (
                        <option key={schema} value={schema}>{schema}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Таблица:</label>
                <select value={selectedTable} onChange={handleTableChange}>
                    {selectedSchema && databases[selectedSchema].map((table) => (
                        <option key={table} value={table}>{table}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleExport}>Экспортировать в Excel</button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <button onClick={handleImport}>Импортировать из Excel</button>
            </div>
        </div>
    );
};

export default DataManager;
