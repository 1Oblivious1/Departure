import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NotFound from './pages/NotFound';
import MainNavigation from './components/MainNavigation';
import MapPage from './pages/MapPage';
import TasksPage from './pages/TasksPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import AuthDialog from './components/AuthDialog';
import { ThemeProvider, createTheme, CssBaseline, Container, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';

const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const AppContent = () => {
    const { user, loading, isAuthDialogOpen, setIsAuthDialogOpen, handleAuthSuccess } = useAuth();

    // Memoize handler functions to prevent unnecessary re-renders
    const handleCloseAuthDialog = useMemo(() => () => setIsAuthDialogOpen(false), [setIsAuthDialogOpen]);
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/map" />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/tasks" element={
                    <Container maxWidth="lg" sx={{ pb: 10, pt: 2, width: '100%' }}>
                        <TasksPage />
                    </Container>
                } />
                <Route path="/feed" element={
                    <Container maxWidth="lg" sx={{ pb: 10, pt: 2, width: '100%' }}>
                        <FeedPage />
                    </Container>
                } />
                <Route path="/profile" element={
                    <Container maxWidth="lg" sx={{ pb: 10, pt: 2, width: '100%' }}>
                        {user ? <Navigate to={`/profile/${user.userId}`} /> : <ProfilePage />}
                    </Container>
                } />
                <Route path="/profile/:userId" element={
                    <Container maxWidth="lg" sx={{ pb: 10, pt: 2, width: '100%' }}>
                        <ProfilePage />
                    </Container>
                } />
                <Route path="*" element={
                    <Container maxWidth="lg" sx={{ pb: 10, pt: 2, width: '100%' }}>
                        <NotFound />
                    </Container>
                } />
            </Routes>
            <MainNavigation />
            
            {/* Single AuthDialog for the entire app */}
            <AuthDialog
                open={isAuthDialogOpen}
                onClose={handleCloseAuthDialog}
                onSuccess={handleAuthSuccess}
            />
        </Router>
    );
};

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
            <SnackbarProvider 
                maxSnack={3} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={3000}
            >
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;