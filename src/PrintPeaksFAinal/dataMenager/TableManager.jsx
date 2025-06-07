// src/components/TableManager.js
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import { saveAs } from 'file-saver';

const TableManager = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        // Получение списка таблиц при загрузке компонента
        axios.post('/db/tables', )
            .then(response => {
                console.log(response.data);
                const tableList = response.data.tables;
                setTables(tableList);
                if (tableList.length > 0) {
                    setSelectedTable(tableList[0]);
                }
            })
            .catch(error => {
                console.error(error);
                // alert('Не удалось получить список таблиц.');
            });
    }, []);

    const handleExport = () => {
        if (!selectedTable) {
            alert('Выберите таблицу для экспорта.');
            return;
        }
        let dataToSend = {
            table: selectedTable,
            // table: "Material",
            schema: "printpeaksdbnew",
        }
        // setLoad(true)
        axios.post(`/db/export-excel`, dataToSend, { responseType: 'arraybuffer' })
            .then(response => {
                console.log(response.data);
                const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `Material(склад).xlsx`);
            })
            .catch(error => {
                console.log(error);
                if (error.response.status === 403) {
                    // navigate('/login');
                }
                // setError(error)
                // setLoad(false)
            })
    };

    const handleImport = () => {
        if (!selectedTable) {
            alert('Выберите таблицу для импорта.');
            return;
        }

        if (!file) {
            alert('Выберите файл для импорта.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('table', selectedTable);

        axios.post('/db/import-excel', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                // Добавьте необходимые заголовки авторизации, если требуется
                // 'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => {
                alert(response.data.message || 'Данные успешно импортированы.');
            })
            .catch(error => {
                console.error(error);
                // alert('Не удалось импортировать данные.');
            });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    return (
        <div>
            <h1>Управление Таблицами</h1>

            {/*<div>*/}
            {/*    <label>Таблица:</label>*/}
            {/*    <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>*/}
            {/*        {tables.map((table) => (*/}
            {/*            <option key={table} value={table}>{table}</option>*/}
            {/*        ))}*/}
            {/*    </select>*/}
            {/*</div>*/}

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleExport}>Экспортировать в Excel Material(Склад).</button>
            </div>

            <div style={{ marginTop: '20px' }}>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <button onClick={handleImport}>Импортировать из Excel Material(Склад)</button>
            </div>
        </div>
    );
};

export default TableManager;
