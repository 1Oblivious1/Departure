import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return <p>Вы не авторизованы. Перейдите к <a href="/login">входу</a>.</p>;
    }

    return (
        <div className="container">
            <h1>Добро пожаловать!</h1>
            <p>Ваш ID: {user.userId}</p>
            <button onClick={logout}>Выйти</button>
        </div>
    );
};

export default Home;