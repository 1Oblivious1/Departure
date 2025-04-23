import axios from 'axios';

const API_URL = 'http://localhost:5234'; // Замените на ваш хост

// Auth operations
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Ошибка регистрации:', error.response?.data || error.message);
        throw new Error(error.response?.data || 'Ошибка регистрации');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
        return response.data;
    } catch (error) {
        console.error('Ошибка входа:', error.response?.data || error.message);
        throw new Error(error.response?.data || 'Ошибка входа');
    }
};

// Task operations
export const createTask = async (taskData) => {
    try {
        const response = await axios.post(`${API_URL}/api/task`, taskData);
        return response.data;
    } catch (error) {
        console.error('Ошибка создания задачи:', error.response?.data || error.message);
        throw new Error(error.response?.data || 'Ошибка создания задачи');
    }
};

export const fetchAllTasks = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/task`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения задач:', error.message);
        throw new Error('Ошибка получения задач');
    }
};

export const fetchUserTasks = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/user/${userId}/submissions`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения задач пользователя:', error.message);
        throw new Error('Ошибка получения задач пользователя');
    }
};

export const startTask = async (userId, taskId) => {
    try {
        const response = await axios.post(`${API_URL}/api/task/start`, { userId, taskId });
        return response.data;
    } catch (error) {
        console.error('Ошибка начала задачи:', error.message);
        throw new Error('Ошибка начала задачи');
    }
};

export const completeTask = async (submissionId) => {
    try {
        const response = await axios.post(`${API_URL}/api/task/complete/${submissionId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка завершения задачи:', error.message);
        throw new Error('Ошибка завершения задачи');
    }
};

export const failTask = async (submissionId) => {
    try {
        const response = await axios.post(`${API_URL}/api/task/fail/${submissionId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка отказа от задачи:', error.message);
        throw new Error('Ошибка отказа от задачи');
    }
};