import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) {
        return <p>Вы не авторизованы. Перейдите к <a href="/login">входу</a>.</p>;
    }

    return (
        <div>
            <h1>Добро пожаловать!</h1>
            <button onClick={logout}>Выйти</button>
        </div>
    );
};

export default Home;