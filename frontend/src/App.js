import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import MainNavigation from './components/MainNavigation';
import MapPage from './pages/MapPage';
import TasksPage from './pages/TasksPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const App = () => {
    const [themeMode, setThemeMode] = useState(getSystemTheme());
    const theme = useMemo(() => createTheme({
        palette: { mode: themeMode }
    }), [themeMode]);

    const handleThemeChange = () => {
        setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <MainNavigation />
                    <Routes>
                        <Route path="/" element={<Navigate to="/map" />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/tasks" element={<TasksPage />} />
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/profile/*" element={<ProfilePage themeMode={themeMode} onThemeChange={handleThemeChange} />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;