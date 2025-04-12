import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ mail: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await loginUser(credentials); // { userId: 2 }
            console.log('Получен userId:', data.userId); // Логируем userId
            login(data.userId); // Передаем userId в контекст
            alert(`Добро пожаловать!`);
            navigate('/');
        } catch (err) {
            console.error('Ошибка входа:', err.message);
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h2>Вход</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="mail"
                    placeholder="Mail"
                    value={credentials.mail}
                    onChange={(e) => setCredentials({ ...credentials, mail: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default LoginForm;