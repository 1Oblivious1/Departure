import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/AuthMenu.module.css';

const AuthMenu = () => {
    return (
        <div className={styles.menu}>
            <Link to="/login" className={styles.link}>Войти</Link>
            <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
        </div>
    );
};

export default AuthMenu;