import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { loginUser, registerUser, getUserProfile } from '../services/api';
import { useSnackbar } from 'notistack';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);

    // Initialize user state from localStorage
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                
                if (token && userId) {
                    setLoading(true);
                    try {
                        const userData = await getUserProfile(userId);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error('Error loading user profile:', error);
                        // Clear invalid credentials
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth state:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            const response = await loginUser({ mail: email, password });
            
            localStorage.setItem('token', response.token || 'dummy-token');
            localStorage.setItem('userId', response.userId || response.id);
            
            // Укажем значение userId явно, чтобы его можно было использовать для навигации
            const userId = response.userId || response.id;
            
            setUser({
                ...response,
                userId: userId // гарантируем, что userId будет установлен
            });
            setIsAuthenticated(true);
            
            // Автоматически закрываем диалог и показываем уведомление
            setAuthDialogOpen(false);
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (name, email, password, avatarUrl = '') => {
        try {
            setLoading(true);
            const response = await registerUser({ 
                name, 
                mail: email, 
                password, 
                avatarUrl 
            });
            
            localStorage.setItem('token', response.token || 'dummy-token');
            localStorage.setItem('userId', response.userId || response.id);
            
            // Укажем значение userId явно, чтобы его можно было использовать для навигации
            const userId = response.userId || response.id;
            
            setUser({
                ...response,
                userId: userId // гарантируем, что userId будет установлен
            });
            setIsAuthenticated(true);
            
            // Автоматически закрываем диалог
            setAuthDialogOpen(false);
            
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            
            setUser(null);
            setIsAuthenticated(false);
            
            enqueueSnackbar('Logged out successfully', { variant: 'success' });
        } catch (error) {
            console.error('Logout error:', error);
            enqueueSnackbar('Error during logout', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    const showAuthDialog = useCallback(() => {
        // Use setTimeout to avoid state updates during rendering
        setTimeout(() => {
            setAuthDialogOpen(true);
        }, 0);
    }, []);

    const closeAuthDialog = useCallback(() => {
        // Use setTimeout to avoid state updates during rendering
        setTimeout(() => {
            setAuthDialogOpen(false);
        }, 0);
    }, []);

    const handleAuthSuccess = useCallback(() => {
        // Use setTimeout to avoid state updates during rendering
        setTimeout(() => {
            setAuthDialogOpen(false);
        }, 0);
    }, []);

    const updateUserProfile = useCallback(async (userId, profileData) => {
        try {
            setLoading(true);
            // Since there's no updateUserProfile in the API, we'll just update local state
            // and simulate a successful update
            setUser(prev => ({
                ...prev,
                ...profileData
            }));
            enqueueSnackbar('Profile updated successfully', { variant: 'success' });
            return { ...user, ...profileData };
        } catch (error) {
            console.error('Error updating profile:', error);
            enqueueSnackbar('Error updating profile', { variant: 'error' });
            throw error;
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar, user]);

    const value = {
        user,
        loading,
        isAuthenticated,
        authDialogOpen,
        login,
        register,
        logout,
        showAuthDialog,
        closeAuthDialog,
        handleAuthSuccess,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};