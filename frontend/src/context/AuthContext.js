import React, { createContext, useState, useEffect } from 'react';

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

    const login = (userId) => {
        localStorage.setItem('userId', userId);
        setUser({ userId });
    };

    const logout = () => {
        localStorage.removeItem('userId');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};