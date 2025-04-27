import axios from 'axios';

const API_URL = 'http://localhost:5234'; // Замените на ваш хост

// Auth operations
export const registerUser = async (userData) => {
    try {
        console.log('Sending registration data:', userData);
        const response = await axios.post(`${API_URL}/api/auth/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Ошибка регистрации:', error.response?.data || error.message);
        
        // Improved error handling to provide more specific error messages
        if (error.response) {
            // If the response data is a string (direct error message from backend)
            if (typeof error.response.data === 'string') {
                throw new Error(error.response.data);
            }
            
            // Extract validation errors if available
            if (error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .join(', ');
                throw new Error(errorMessages);
            }
            
            // Handle other types of error responses
            throw new Error(error.response.data.title || error.response.data || 'Ошибка регистрации: неверные данные');
        }
        
        throw new Error('Ошибка регистрации. Пожалуйста, попробуйте позже.');
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
        return response.data;
    } catch (error) {
        console.error('Ошибка входа:', error.response?.data || error.message);
        
        // Improved error handling to provide more specific error messages
        if (error.response) {
            // Extract validation errors if available
            if (error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors)
                    .flat()
                    .join(', ');
                throw new Error(errorMessages);
            }
            // Handle other types of error responses
            throw new Error(error.response.data.title || 'Ошибка входа: неверные данные');
        }
        
        throw new Error('Ошибка входа. Пожалуйста, попробуйте позже.');
    }
};

// User Profile API
export const getUserProfile = async (userId) => {
    try {
        // Check for undefined or null userId early and return a friendly message instead of making the API call
        if (!userId) {
            console.error('Attempted to get user profile with undefined or null userId');
            return {
                profile: {
                    idUserProfilePublic: null,
                    name: "Требуется вход в аккаунт",
                    mail: "",
                    avatarUrl: "",
                    points: 0,
                    requiresLogin: true
                },
                subscribersCount: 0,
                subscriptionsCount: 0,
                completedTasksCount: 0,
                totalLikes: 0,
                posts: []
            };
        }
        
        // Log the request for debugging
        console.log(`Fetching user profile for ID: ${userId}`);
        
        // Make sure userId is properly formatted
        const formattedUserId = Number(userId) || userId;
        
        const response = await axios.get(`${API_URL}/api/user/profile/${formattedUserId}`);
        console.log('User profile response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        
        // Return a default profile structure instead of throwing an error
        // This helps the UI show something meaningful rather than breaking
        return {
            profile: {
                idUserProfilePublic: userId,
                name: "Требуется вход в аккаунт",
                mail: "",
                avatarUrl: "",
                points: 0,
                requiresLogin: true
            },
            subscribersCount: 0,
            subscriptionsCount: 0,
            completedTasksCount: 0,
            totalLikes: 0,
            posts: []
        };
    }
};

export const getUserRating = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/user/rating/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения рейтинга:', error.message);
        throw new Error('Ошибка получения рейтинга');
    }
};

// Subscriptions API
export const getUserSubscriptions = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/user/${userId}/subscriptions`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения подписок:', error.message);
        throw new Error('Ошибка получения подписок');
    }
};

export const subscribeToUser = async (subscriberId, targetUserId) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/subscribe`, {
            subscriberId,
            targetUserId
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка подписки:', error.message);
        throw new Error('Ошибка подписки');
    }
};

export const unsubscribeFromUser = async (subscriberId, targetUserId) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/unsubscribe`, {
            subscriberId,
            targetUserId
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка отписки:', error.message);
        throw new Error('Ошибка отписки');
    }
};

export const checkSubscriptionStatus = async (subscriberId, targetUserId) => {
    try {
        const response = await axios.post(`${API_URL}/api/user/check-subscription`, {
            subscriberId: subscriberId,
            targetUserId: targetUserId
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка проверки подписки:', error.message);
        throw new Error('Ошибка проверки подписки');
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
        const response = await axios.get(`${API_URL}/api/task/user/${userId}/tasks`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения задач пользователя:', error.message);
        throw new Error('Ошибка получения задач пользователя');
    }
};

export const getUserTaskIds = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/task/user/${userId}/task-ids`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения ID задач пользователя:', error.message);
        throw new Error('Ошибка получения ID задач пользователя');
    }
};

export const startTask = async (userId, taskId) => {
    try {
        const response = await axios.post(`${API_URL}/api/task/start`, { 
            userId, 
            taskId 
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка начала задачи:', error.message);
        throw new Error('Ошибка начала задачи');
    }
};

export const completeTask = async (userId, taskId, photoUrl, description) => {
    try {
        // Ensure userId and taskId are properly formatted
        const formattedUserId = Number(userId) || userId;
        const formattedTaskId = Number(taskId) || taskId;
        
        // Log request details for debugging
        console.log('Sending task completion request:', {
            endpoint: `${API_URL}/api/task/complete`,
            data: {
                userId: formattedUserId,
                taskId: formattedTaskId,
                photoUrl,
                description
            }
        });
        
        const response = await axios.post(`${API_URL}/api/task/complete`, {
            userId: formattedUserId,
            taskId: formattedTaskId,
            photoUrl,
            description
        });
        
        console.log('Task completion response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Ошибка завершения задачи:', error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
            throw new Error(`Ошибка завершения задачи: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request was made but no response received:', error.request);
            throw new Error('Сервер не отвечает. Проверьте подключение к интернету и работу сервера.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
            throw new Error(`Ошибка настройки запроса: ${error.message}`);
        }
    }
};

// Achievement operations
export const getUserAchievements = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/api/achievement/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения достижений:', error.message);
        throw new Error('Ошибка получения достижений');
    }
};

// Newsfeed operations
export const getNewsFeed = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/task/news`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения ленты новостей:', error.message);
        throw new Error('Ошибка получения ленты новостей');
    }
};

export const getPost = async (postId) => {
    try {
        const response = await axios.get(`${API_URL}/api/post/${postId}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка получения поста:', error.message);
        throw new Error('Ошибка получения поста');
    }
};

export const addComment = async (postId, userId, text) => {
    try {
        const response = await axios.post(`${API_URL}/api/post/${postId}/comment`, {
            userId,
            text
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка добавления комментария:', error.message);
        // Return a default response instead of throwing an error
        return { 
            success: false, 
            comments: [] 
        };
    }
};

export const likePost = async (postId) => {
    try {
        const response = await axios.post(`${API_URL}/api/post/${postId}/like`);
        return response.data;
    } catch (error) {
        console.error('Ошибка лайка поста:', error.message);
        throw new Error('Ошибка лайка поста');
    }
};

// Favorites operations
export const getUserFavorites = async (userId) => {
    try {
        console.log(`[API] Fetching favorites for user ${userId}`);
        
        // Валидация ID пользователя
        if (!userId) {
            console.warn('[API] getUserFavorites called with empty userId');
            return { posts: [] };
        }
        
        const formattedUserId = Number(userId) || userId;
        
        console.log(`[API] Making request to: ${API_URL}/api/user/favorites/${formattedUserId}`);
        const response = await axios.get(`${API_URL}/api/user/favorites/${formattedUserId}`);
        
        console.log('[API] Get favorites response status:', response.status);
        console.log('[API] Get favorites response data:', response.data);
        
        // Проверка и нормализация данных
        if (Array.isArray(response.data)) {
            console.log('[API] Response is an array, returning wrapped in posts object');
            return { posts: response.data };
        } else if (response.data && typeof response.data === 'object') {
            if (Array.isArray(response.data.posts)) {
                console.log('[API] Response has posts array, returning as is');
                return response.data;
            } else {
                console.log('[API] Response is an object without posts array, wrapping in posts object');
                return { posts: [response.data] };
            }
        }
        
        console.log('[API] Response format unknown, returning empty posts array');
        return { posts: [] };
    } catch (error) {
        console.error('[API] Error getting favorites:', error);
        
        if (error.response) {
            console.error('[API] Server response status:', error.response.status);
            console.error('[API] Server response data:', error.response.data);
        } else if (error.request) {
            console.error('[API] No response received from server');
        } else {
            console.error('[API] Error setting up request:', error.message);
        }
        
        // Return empty array instead of throwing
        return { posts: [] };
    }
};

export const addToFavorites = async (userId, postId) => {
    try {
        console.log(`Adding post ${postId} to favorites for user ${userId}`);
        
        // Ensure numeric values for IDs
        const numericUserId = parseInt(userId);
        const numericPostId = parseInt(postId);
        
        if (isNaN(numericUserId) || isNaN(numericPostId)) {
            console.error('Invalid ID format:', { userId, postId });
            throw new Error('Invalid ID format');
        }
        
        const response = await axios.post(`${API_URL}/api/user/favorites/add`, {
            UserId: numericUserId,
            PostId: numericPostId
        });
        
        console.log('Add to favorites response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        
        if (error.response) {
            console.error('Server response status:', error.response.status);
            console.error('Server response data:', error.response.data);
            
            // Try with different case for parameter names
            if (error.response.status === 415 || error.response.status === 400) {
                try {
                    console.log('Attempting alternate request format');
                    
                    // Try with a different content type or format
                    const altResponse = await axios.post(`${API_URL}/api/user/favorites/add`, 
                        `UserId=${userId}&PostId=${postId}`,
                        { 
                            headers: { 
                                'Content-Type': 'application/x-www-form-urlencoded' 
                            } 
                        }
                    );
                    
                    console.log('Alternate add to favorites response:', altResponse.data);
                    return altResponse.data;
                } catch (altError) {
                    console.error('Alternate request also failed:', altError);
                    if (altError.response) {
                        console.error('Alternate response:', altError.response.status, altError.response.data);
                    }
                }
            }
        }
        
        throw new Error('Не удалось добавить в избранное. Пожалуйста, попробуйте позже.');
    }
};

export const removeFromFavorites = async (userId, postId) => {
    try {
        console.log(`Removing post ${postId} from favorites for user ${userId}`);
        
        // Ensure numeric values for IDs
        const numericUserId = parseInt(userId);
        const numericPostId = parseInt(postId);
        
        if (isNaN(numericUserId) || isNaN(numericPostId)) {
            console.error('Invalid ID format:', { userId, postId });
            throw new Error('Invalid ID format');
        }
        
        const response = await axios.delete(`${API_URL}/api/user/favorites/delete`, {
            data: {
                UserId: numericUserId,
                PostId: numericPostId
            }
        });
        
        console.log('Remove from favorites response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error removing from favorites:', error);
        
        if (error.response) {
            console.error('Server response status:', error.response.status);
            console.error('Server response data:', error.response.data);
            
            // Try with different case for parameter names
            if (error.response.status === 415 || error.response.status === 400) {
                try {
                    console.log('Attempting alternate request format');
                    
                    // Try as a query parameter request
                    const altResponse = await axios.delete(
                        `${API_URL}/api/user/favorites/delete?UserId=${userId}&PostId=${postId}`
                    );
                    
                    console.log('Alternate remove from favorites response:', altResponse.data);
                    return altResponse.data;
                } catch (altError) {
                    console.error('Alternate request also failed:', altError);
                    if (altError.response) {
                        console.error('Alternate response:', altError.response.status, altError.response.data);
                    }
                }
            }
        }
        
        throw new Error('Не удалось удалить из избранного. Пожалуйста, попробуйте позже.');
    }
};

export const checkFavoriteStatus = async (userId, postId) => {
    try {
        // Use POST request with userId and postId in the body
        const response = await axios.post(`${API_URL}/api/user/favorites/check`, {
            userId: userId,
            postId: postId
        });
        console.log('Check favorite status response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error checking favorite status:', error);
        
        // Try alternate methods if the first one fails
        try {
            console.log('Attempting alternate method with different endpoint');
            const altResponse = await axios.post(`${API_URL}/api/favorites/check`, {
                userId: userId,
                postId: postId
            });
            return altResponse.data;
        } catch (altError) {
            // Return default value (not favorited) instead of throwing
            console.log('Returning default favorite status (0)');
            return 0;
        }
    }
};

// Account operations
export const deleteAccount = async () => {
    try {
        const response = await axios.delete(`${API_URL}/api/user/delete`, {
            withCredentials: true
        });
        console.log('Account deletion response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting account:', error);
        
        if (error.response) {
            console.error('Server response status:', error.response.status);
            console.error('Server response data:', error.response.data);
        }
        
        throw new Error('Не удалось удалить аккаунт. Пожалуйста, попробуйте позже.');
    }
};