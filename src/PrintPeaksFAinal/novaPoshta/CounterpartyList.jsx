import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiUrl = 'https://api.novaposhta.ua/v2.0/json/';
const apiKey = 'ecb23e28cbe38cf7c78449e15c7979e3';

const CounterpartyManager = () => {
    const [counterparties, setCounterparties] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [selectedCounterparty, setSelectedCounterparty] = useState(null);

    const [cpFormData, setCpFormData] = useState({ FirstName: '', LastName: '', Phone: '', CityRef: '' });
    const [ctFormData, setCtFormData] = useState({ FirstName: '', LastName: '', Phone: '' });

    const [editingCP, setEditingCP] = useState(null);
    const [editingCT, setEditingCT] = useState(null);

    useEffect(() => {
        fetchCounterparties();
    }, []);

    const fetchCounterparties = async () => {
        const res = await axios.post(apiUrl, {
            apiKey,
            modelName: 'Counterparty',
            calledMethod: 'getCounterparties',
            methodProperties: { CounterpartyProperty: 'Sender', Page: '1' }
        });
        if (res.data.success) setCounterparties(res.data.data);
    };

    const fetchContacts = async (counterpartyRef) => {
        const res = await axios.post(apiUrl, {
            apiKey,
            modelName: 'ContactPerson',
            calledMethod: 'getContactPersons',
            methodProperties: { CounterpartyRef: counterpartyRef }
        });
        if (res.data.success) setContacts(res.data.data);
    };

    const saveOrUpdateCounterparty = async () => {
        const method = editingCP ? 'update' : 'save';
        const properties = editingCP
            ? { Ref: editingCP.Ref, ...cpFormData }
            : { CounterpartyType: 'PrivatePerson', CounterpartyProperty: 'Sender', ...cpFormData };

        const res = await axios.post(apiUrl, {
            apiKey,
            modelName: 'Counterparty',
            calledMethod: method,
            methodProperties: properties
        });
        if (res.data.success) {
            fetchCounterparties();
            setEditingCP(null);
            setCpFormData({ FirstName: '', LastName: '', Phone: '', CityRef: '' });
        } else alert(res.data.errors.join(', '));
    };

    const saveOrUpdateContact = async () => {
        const method = editingCT ? 'update' : 'save';
        const properties = editingCT
            ? { Ref: editingCT.Ref, ...ctFormData }
            : { CounterpartyRef: selectedCounterparty.Ref, ...ctFormData };

        const res = await axios.post(apiUrl, {
            apiKey,
            modelName: 'ContactPerson',
            calledMethod: method,
            methodProperties: properties
        });
        if (res.data.success) {
            fetchContacts(selectedCounterparty.Ref);
            setEditingCT(null);
            setCtFormData({ FirstName: '', LastName: '', Phone: '' });
        } else alert(res.data.errors.join(', '));
    };

    return (
        <div style={{ padding: '15px' }}>
            <h3>Контрагенты</h3>
            <table border="1" width="100%">
                <thead>
                <tr>
                    <th>Имя</th><th>Фамилия</th><th>Телефон</th><th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {counterparties.map(cp => (
                    <tr key={cp.Ref}>
                        <td>{cp.FirstName}</td>
                        <td>{cp.LastName}</td>
                        <td>{cp.Phones}</td>
                        <td>
                            <button onClick={() => {
                                setSelectedCounterparty(cp);
                                fetchContacts(cp.Ref);
                            }}>
                                {selectedCounterparty?.Ref === cp.Ref ? 'Выбран' : 'Выбрать'}
                            </button>
                            <button onClick={() => {
                                setEditingCP(cp);
                                setCpFormData({ FirstName: cp.FirstName, LastName: cp.LastName, Phone: cp.Phones, CityRef: cp.City });
                            }}>Редактировать</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h4>{editingCP ? 'Редактирование' : 'Добавить'} контрагента</h4>
            <form onSubmit={(e) => { e.preventDefault(); saveOrUpdateCounterparty(); }}>
                <input placeholder="Имя" value={cpFormData.FirstName} onChange={e => setCpFormData({ ...cpFormData, FirstName: e.target.value })} required/>
                <input placeholder="Фамилия" value={cpFormData.LastName} onChange={e => setCpFormData({ ...cpFormData, LastName: e.target.value })} required/>
                <input placeholder="Телефон" value={cpFormData.Phone} onChange={e => setCpFormData({ ...cpFormData, Phone: e.target.value })} required/>
                <input placeholder="CityRef" value={cpFormData.CityRef} onChange={e => setCpFormData({ ...cpFormData, CityRef: e.target.value })} required/>
                <button type="submit">{editingCP ? 'Обновить' : 'Создать'}</button>
                {editingCP && <button type="button" onClick={() => setEditingCP(null)}>Отмена</button>}
            </form>

            {selectedCounterparty && (
                <>
                    <h3>Контакты: {selectedCounterparty.FirstName} {selectedCounterparty.LastName}</h3>
                    <table border="1" width="100%">
                        <thead>
                        <tr><th>Имя</th><th>Фамилия</th><th>Телефон</th><th>Действия</th></tr>
                        </thead>
                        <tbody>
                        {contacts.map(ct => (
                            <tr key={ct.Ref}>
                                <td>{ct.FirstName}</td><td>{ct.LastName}</td><td>{ct.Phones}</td>
                                <td><button onClick={() => {
                                    setEditingCT(ct);
                                    setCtFormData({ FirstName: ct.FirstName, LastName: ct.LastName, Phone: ct.Phones });
                                }}>Редактировать</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h4>{editingCT ? 'Редактирование' : 'Добавить'} контакт</h4>
                    <form onSubmit={(e) => { e.preventDefault(); saveOrUpdateContact(); }}>
                        <input placeholder="Имя" value={ctFormData.FirstName} onChange={e => setCtFormData({ ...ctFormData, FirstName: e.target.value })} required/>
                        <input placeholder="Фамилия" value={ctFormData.LastName} onChange={e => setCtFormData({ ...ctFormData, LastName: e.target.value })} required/>
                        <input placeholder="Телефон" value={ctFormData.Phone} onChange={e => setCtFormData({ ...ctFormData, Phone: e.target.value })} required/>
                        <button type="submit">{editingCT ? 'Обновить' : 'Создать'}</button>
                        {editingCT && <button type="button" onClick={() => setEditingCT(null)}>Отмена</button>}
                    </form>
                </>
            )}
        </div>
    );
};

export default CounterpartyManager;
