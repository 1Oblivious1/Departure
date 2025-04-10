import axios from 'axios';

const API_URL = 'http://localhost:5234';

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/register`, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Ошибка регистрации');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Ошибка входа');
    }
};