import axios from 'axios';

const API_URL = 'http://localhost:5234'; 

// Auth operations
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

// Task operations
export const fetchTasks = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/task`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения заданий:', error.message);
        // Return mock data if server is unavailable
        return mockTasksData;
    }
};

export const fetchUserTasks = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/users/${userId}/task`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения заданий пользователя:', error.message);
        // Return user tasks from localStorage if server is unavailable
        const myTasks = JSON.parse(localStorage.getItem('myTasks') || '[]');
        return mockTasksData.filter(task => myTasks.includes(task.id));
    }
};

export const toggleTaskStatus = async (taskId, status) => {
    try {
        const response = await axios.patch(`${API_URL}/api/task/${taskId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Ошибка обновления статуса задания:', error.message);
        // Update localStorage if server is unavailable
        const myTasks = JSON.parse(localStorage.getItem('myTasks') || '[]');
        if (status === 'active') {
            if (!myTasks.includes(taskId)) {
                localStorage.setItem('myTasks', JSON.stringify([...myTasks, taskId]));
            }
        } else {
            localStorage.setItem('myTasks', JSON.stringify(myTasks.filter(id => id !== taskId)));
        }
        return { taskId, status };
    }
};

export const likeTask = async (taskId) => {
    try {
        const response = await axios.post(`${API_URL}/api/task/${taskId}/like`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при лайке задания:', error.message);
        // Update localStorage if server is unavailable
        const likedTasks = JSON.parse(localStorage.getItem('likedTasks') || '[]');
        if (!likedTasks.includes(taskId)) {
            localStorage.setItem('likedTasks', JSON.stringify([...likedTasks, taskId]));
        }
        return { taskId, liked: true };
    }
};

export const unlikeTask = async (taskId) => {
    try {
        const response = await axios.delete(`${API_URL}/api/task/${taskId}/like`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении лайка задания:', error.message);
        // Update localStorage if server is unavailable
        const likedTasks = JSON.parse(localStorage.getItem('likedTasks') || '[]');
        localStorage.setItem('likedTasks', JSON.stringify(likedTasks.filter(id => id !== taskId)));
        return { taskId, liked: false };
    }
};

export const likeBlogPost = async (postId) => {
    try {
        const response = await axios.post(`${API_URL}/api/blog/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при лайке поста:', error.message);
        // Update localStorage if server is unavailable
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        if (!likedPosts.includes(postId)) {
            localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, postId]));
        }
        return { postId, liked: true };
    }
};

export const unlikeBlogPost = async (postId) => {
    try {
        const response = await axios.delete(`${API_URL}/api/blog/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении лайка поста:', error.message);
        // Update localStorage if server is unavailable
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts.filter(id => id !== postId)));
        return { postId, liked: false };
    }
};

// Mock data for offline development
const mockTasksData = [
    {
        id: 1,
        idTask: 1, 
        title: 'Помощь пожилым людям',
        description: 'Требуется помощь пожилым людям с покупками и доставкой продуктов',
        latitude: 55.751244,
        longitude: 37.618423,
        address: 'Москва, ул. Тверская, 1',
        category: 'Волонтерство',
        difficulty: 0,
        price: 500,
        isMyTask: false,
        liked: false
    },
    {
        id: 2,
        idTask: 2,
        title: 'Уборка парка',
        description: 'Организация уборки территории парка от мусора',
        latitude: 55.753215,
        longitude: 37.622504,
        address: 'Москва, Парк Горького',
        category: 'Участие',
        difficulty: 1,
        price: 700,
        isMyTask: false,
        liked: false
    },
    {
        id: 3,
        idTask: 3, 
        title: 'Сбор вещей для нуждающихся',
        description: 'Сбор одежды, игрушек и других вещей для нуждающихся семей',
        latitude: 55.754124,
        longitude: 37.620169,
        address: 'Москва, ул. Пушкина, 10',
        category: 'Помощь',
        difficulty: 2,
        price: 0,
        isMyTask: false,
        liked: false
    }
];