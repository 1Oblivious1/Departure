import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import AuthButtons from './components/AuthButtons';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AuthButtons />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;