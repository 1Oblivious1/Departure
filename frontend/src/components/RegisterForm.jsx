import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const [userData, setUserData] = useState({ name: '', mail: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await registerUser(userData);
            setSuccess('Вы успешно зарегистрировались!');
            setTimeout(() => navigate('/login'), 2000); // Перенаправление на страницу входа
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h2>Регистрация</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Имя"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    required
                />
                <input
                    type="mail"
                    placeholder="Mail"
                    value={userData.mail}
                    onChange={(e) => setUserData({ ...userData, mail: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    required
                />
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default RegisterForm;