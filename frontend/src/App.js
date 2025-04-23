import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import MainNavigation from './components/MainNavigation';
import MapPage from './pages/MapPage';
import TasksPage from './pages/TasksPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import AuthDialog from './components/AuthDialog';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);

    // Проверяем состояние авторизации при загрузке
    useEffect(() => {
        if (!loading && !user) {
            setIsAuthDialogOpen(true);
        }
    }, [loading, user]);

    const handleAuthSuccess = () => {
        setIsAuthDialogOpen(false);
    };

    return (
        <>
            <Router>
                <MainNavigation />
                <Routes>
                    <Route path="/" element={<Navigate to="/map" />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/feed" element={<FeedPage />} />
                    <Route path="/profile/*" element={<ProfilePage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>

            {/* AuthDialog */}
            <AuthDialog
                open={isAuthDialogOpen}
                onClose={() => setIsAuthDialogOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
};

const App = () => {
    const [themeMode, setThemeMode] = React.useState(getSystemTheme());
    const theme = React.useMemo(() => createTheme({
        palette: { mode: themeMode }
    }), [themeMode]);

    const handleThemeChange = () => {
        setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;