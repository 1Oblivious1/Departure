import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            setUser({ userId });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await loginUser({ mail: email, password });
        localStorage.setItem('userId', response.userId);
        setUser({ userId: response.userId });
    };

    const register = async (name, email, password) => {
        const response = await registerUser({ name, mail: email, password });
        localStorage.setItem('userId', response.userId);
        setUser({ userId: response.userId });
    };

    const logout = () => {
        localStorage.removeItem('userId');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};