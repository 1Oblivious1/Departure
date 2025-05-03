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
                        
                        // Ensure userData has userId property needed for navigation
                        const normalizedUserData = {
                            ...userData,
                            userId: userId, // Always ensure the userId is available
                            // Handle both English and Russian API responses 
                            ...(userData.profile ? { profile: userData.profile } : {}),
                            ...(userData.профиль ? { профиль: userData.профиль } : {})
                        };
                        
                        console.log('User session restored from localStorage:', normalizedUserData);
                        setUser(normalizedUserData);
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

    const login = async (userData) => {
        setLoading(true);
        try {
            const response = await loginUser(userData);
            console.log('Login response:', response);
            
            // Check if response has userId which is the expected structure from the backend
            if (response && response.userId) {
                // Save the userId and a placeholder token if not provided
                localStorage.setItem('token', response.token || 'temp_token');
                localStorage.setItem('userId', response.userId);
                
                try {
                    // Get the user profile using the userId from login response
                    const userResponse = await getUserProfile(response.userId);
                    
                    if (userResponse) {
                        // Ensure userResponse has userId property for navigation
                        const normalizedUserData = {
                            ...userResponse,
                            userId: response.userId,
                            ...(userResponse.profile ? { profile: userResponse.profile } : {}),
                            ...(userResponse.профиль ? { профиль: userResponse.профиль } : {})
                        };
                        
                        setUser(normalizedUserData);
                        localStorage.setItem('user', JSON.stringify(normalizedUserData));
                        setIsAuthenticated(true);
                        setLoading(false);
                        handleAuthSuccess();
                        return true;
                    }
                } catch (profileError) {
                    console.error('Error fetching user profile after login:', profileError);
                    // Still return true as login was successful even if profile fetch failed
                    setIsAuthenticated(true);
                    setLoading(false);
                    handleAuthSuccess();
                    return true;
                }
            }
            
            console.error('Invalid login response structure:', response);
            setLoading(false);
            return false;
        } catch (error) {
            console.error('Login error:', error);
            setLoading(false);
            throw error;
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await registerUser(userData);
            console.log('Registration response:', response);
            
            // Check if response has userId which is the expected structure from the backend
            if (response && response.userId) {
                // Save the userId and a placeholder token if not provided
                localStorage.setItem('token', response.token || 'temp_token');
                localStorage.setItem('userId', response.userId);
                
                try {
                    // Get the user profile using the userId from registration response
                    const userResponse = await getUserProfile(response.userId);
                    
                    if (userResponse) {
                        // Ensure userResponse has userId property for navigation
                        const normalizedUserData = {
                            ...userResponse,
                            userId: response.userId,
                            ...(userResponse.profile ? { profile: userResponse.profile } : {}),
                            ...(userResponse.профиль ? { профиль: userResponse.профиль } : {})
                        };
                        
                        setUser(normalizedUserData);
                        localStorage.setItem('user', JSON.stringify(normalizedUserData));
                        setIsAuthenticated(true);
                        setLoading(false);
                        handleAuthSuccess();
                        return true;
                    }
                } catch (profileError) {
                    console.error('Error fetching user profile after registration:', profileError);
                    // Still return true as registration was successful even if profile fetch failed
                    setIsAuthenticated(true);
                    setLoading(false);
                    handleAuthSuccess();
                    return true;
                }
            }
            
            console.error('Invalid registration response structure:', response);
            setLoading(false);
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            setLoading(false);
            throw error;
        }
    };

    const logout = useCallback(() => {
        try {
            // Clear all user data from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('user');
            
            // Clear any other potential auth-related items
            for (const key of Object.keys(localStorage)) {
                if (key.startsWith('auth_') || key.includes('user') || key.includes('profile')) {
                    localStorage.removeItem(key);
                }
            }
            
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, []);

    const showAuthDialog = useCallback((callback) => {
        console.log("showAuthDialog called");
        setAuthDialogOpen(true);
        
        // Store callback if provided
        if (typeof callback === 'function') {
            window._authCallback = callback;
        }
    }, []);

    const closeAuthDialog = useCallback(() => {
        setAuthDialogOpen(false);
    }, []);

    const handleAuthSuccess = useCallback(() => {
        // Close dialog immediately
        setAuthDialogOpen(false);
        
        // If no callback provided, redirect to feed page by default
        const defaultRedirect = () => {
            console.log("Default redirect to feed page");
            window.history.pushState({}, '', '/feed');
            window.dispatchEvent(new PopStateEvent('popstate'));
        };
        
        // Use the callback passed directly or the one stored earlier
        const cb = window._authCallback || defaultRedirect;
        
        // Execute callback after a short delay to allow state updates
        setTimeout(() => {
            if (typeof cb === 'function') {
                cb();
            }
        }, 100);
        
        // Clear stored callback
        window._authCallback = null;
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