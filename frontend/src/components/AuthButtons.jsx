import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthButtons = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-buttons">
            <button onClick={() => navigate('/register')}>Регистрация</button>
            <button className="secondary" onClick={() => navigate('/login')}>Вход</button>
        </div>
    );
};

export default AuthButtons;