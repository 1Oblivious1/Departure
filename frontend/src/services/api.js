import axios from 'axios';

const API_URL = 'http://localhost:5000'; 

export const registerUser = async (userData) => {
    try {
        console.log('Отправляем запрос на регистрацию:', userData); 
        const response = await axios.post(`${API_URL}/api/auth/register`, userData);
        console.log('Ответ от API:', response.data); 
        return response.data;
    } catch (error) {
        console.error('Ошибка регистрации:', error.response?.data || error.message); 
        throw new Error(error.response?.data || 'Ошибка регистрации');
    }
};

export const loginUser = async (credentials) => {
    try {
        console.log('Отправляем запрос на вход:', credentials); 
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
        console.log('Ответ от API:', response.data); 
        return response.data;
    } catch (error) {
        console.error('Ошибка входа:', error.response?.data || error.message); 
        throw new Error(error.response?.data || 'Ошибка входа');
    }
};