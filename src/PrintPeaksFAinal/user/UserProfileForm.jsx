import React, { useState } from 'react';

const UserProfileForm = () => {
    const [formData, setFormData] = useState({
        nickname: '',
        lastName: '',
        firstName: '',
        middleName: '',
        username: '',
        password: '',
        telegram: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        <form className="user-profile-form">
            <div>
                <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="Нік"
                    disabled
                />
            </div>
            <div>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Прізвище"
                    disabled
                />
            </div>
            <div>
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ім'я"
                    disabled
                />
            </div>
            <div>
                <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="По-батькові"
                />
            </div>
            <div>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                />
            </div>
            <div>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                />
            </div>
        </form>
    );
};

export default UserProfileForm;
