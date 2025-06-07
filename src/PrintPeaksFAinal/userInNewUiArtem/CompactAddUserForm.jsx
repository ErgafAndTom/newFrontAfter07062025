import React, {useState} from "react";
import axios from "../../api/axiosInstance";
import {BsPerson, BsEnvelope, BsTelephone, BsTelegram, BsGeoAlt, BsPercent, BsPencil} from "react-icons/bs";
import './CompactAddUserForm.css';

const CompactAddUserForm = ({onClose, onUserAdded, handleCloseAddUser}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validated, setValidated] = useState(false);
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        familyName: '',
        phoneNumber: '',
        email: '',
        telegram: '',
        address: '',
        notes: '',
        discount: 0
    });

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^+\d]/g, '');
        if (!value.startsWith('+')) {
            value = '+38' + value;
        }
        const formattedValue = value
            .replace(/^(\+\d{2})/, '$1 ')
            .replace(/(\d{3})(\d)/, '$1 $2')
            .replace(/(\d{3}) (\d{3})(\d)/, '$1 $2-$3')
            .replace(/-(\d{2})(\d{1,2})/, '-$1-$2');
        setUser({...user, phoneNumber: formattedValue.trim()});
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUser({...user, [name]: value});
        if (name === 'discount') {
            const numeric = value.replace(/[^\d]/g, ''); // залишає тільки цифри
            const percentValue = numeric ? `${numeric}%` : '';
            setUser({...user, discount: percentValue});
        } else {
            setUser({...user, [name]: value});
        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setValidated(true);
        // if (!user.firstName || !user.familyName || !user.phoneNumber) return;

        setLoading(true);
        try {
            const response = await axios.post('/user/create', user);
            setLoading(false);

            if (onUserAdded) onUserAdded(response.data);
            // onClose();
            handleCloseAddUser()
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Помилка при додаванні клієнта');
            console.error('Помилка:', err);
        }
    };

    return (
        <div>

            {error && <div className="user-form-error">{error}</div>}
            <form noValidate

            >
                {[
                    {label: "Ім'я", name: 'firstName', icon: <BsPerson/>},
                    {label: "По батькові", name: 'lastName', icon: <BsPerson/>},
                    {label: "Прізвище", name: 'familyName', icon: <BsPerson/>},
                    {label: "Телефон", name: 'phoneNumber', icon: <BsTelephone/>, onChange: handlePhoneChange},
                    {label: "E-mail", name: 'email', icon: <BsEnvelope/>},
                    {label: "Telegram", name: 'telegram', icon: <BsTelegram/>},
                    {label: "Адреса", name: 'address', icon: <BsGeoAlt/>},
                    {label: "Знижка", name: 'discount', icon: <BsPercent/>},

                ].map(({label, name, icon, onChange}) => (
                    <div key={name} className="form-group-floating"
                    >
                        <div className="input-wrapper">
                            <span className="input-icon">{icon}</span>
                            <input
                                required={label.includes('*')}
                                type="text"
                                placeholder={label}
                                name={name}
                                value={user[name]}
                                onChange={onChange || handleChange}
                                className="form-input"
                            />
                            {/*{!user[name] && (*/}
                            {/*    <label htmlFor={name} className="form-floating-label">{label}</label>*/}
                            {/*)}*/}
                        </div>
                    </div>
                ))}


            </form>


            {[
                {label: "Примітка", name: 'notes', icon: <BsPencil/>},
            ].map(({label, name, icon, onChange}) => (
                <div key={name} className="form-group-floating">
                    <div className="input-wrapper"
                         style={{height: '15vh', border: 'none', overflowWrap: 'break-word'}}>
                        <span className="input-icon">{icon}</span>
                        <textarea
                            required={label.includes('*')}
                            type="text"
                            placeholder={label}
                            name={name}
                            value={user[name]}
                            onChange={onChange || handleChange}
                            className="form-input"
                            style={{height: '15vh', border: 'none', overflowWrap: 'break-word'}}
                        />
                        {/*{!user[name] && (*/}
                        {/*    <label htmlFor={name} className="form-floating-label">{label}</label>*/}
                        {/*)}*/}
                    </div>
                </div>
            ))}
            <button className="adminButtonAdd" onClick={handleSubmit}
                    style={{
                        position: "absolute",
                        right: "2vw",
                        bottom: "2vh",
                    }}>Зберегти
            </button>
        </div>
    );
};

export default CompactAddUserForm;
