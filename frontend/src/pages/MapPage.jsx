import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Button, Chip, CircularProgress, 
  TextField, Avatar, Badge, Divider, List, ListItem, ListItemText, 
  ListItemAvatar, Rating, Menu, MenuItem, ListItemIcon, Switch, 
  Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import { useSnackbar } from 'notistack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { renderToString } from 'react-dom/server';
import { Card, CardContent } from '@mui/material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MapIcon from '@mui/icons-material/Map';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { InputAdornment } from '@mui/material';

// Анимационные константы вместо framer-motion
const animationStyles = {
  fadeIn: {
    opacity: 1,
    transition: 'opacity 0.3s ease-in-out'
  },
  hidden: {
    opacity: 0
  }
};

const difficultyLabels = ['Легко', 'Средне', 'Сложно'];
const difficultyColors = ['success', 'warning', 'error'];

// Constants for map markers
const userMarkerIcon = "https://img.icons8.com/color/36/000000/user-location.png";
const taskMarkerIcon = "https://img.icons8.com/color/36/000000/camera.png";

// Функция для имитации запроса к API
const mockUpdateTaskStatus = (taskId, status) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Task ${taskId} status updated to ${status}`);
      resolve({ success: true });
    }, 500);
  });
};

export default function MapPage() {
  const [tasks, setTasks] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [mapCenter, setMapCenter] = useState([55.7558, 37.6173]);
  const [mapZoom, setMapZoom] = useState(11);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [likedTasks, setLikedTasks] = useState({});
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  
  // Profile-related states
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileTabValue, setProfileTabValue] = useState(0);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [userProfileData, setUserProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Auth dialog state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // State for handling tabs
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'profile', 'tasks'
  const { enqueueSnackbar } = useSnackbar();
  
  // Add state variables for controlling widget visibility
  const [showTaskWidget, setShowTaskWidget] = useState(false);
  const [showCommentsWidget, setShowCommentsWidget] = useState(false);
  
  // Handle map bounds changes
  const handleBoundsChange = (e) => {
    const newCenter = e.originalEvent.map.getCenter();
    const newZoom = e.originalEvent.map.getZoom();
    setMapCenter(newCenter);
    setMapZoom(newZoom);
  };

  // Function to close all widgets
  const closeAllWidgets = () => {
    setShowTaskWidget(false);
    setShowCommentsWidget(false);
    setSelectedTask(null);
  };

  // Handle centering map on user
  const handleCenterOnUser = () => {
    handleCenterUserLocation();
  };

  // Mock data for tasks
  const mockTasks = [
    {
      idTask: 1,
      title: "Сфотографировать Красную площадь",
      description: "Сделайте фотографию Красной площади с разных ракурсов для виртуального тура.",
      latitude: 55.7539,
      longitude: 37.6208,
      difficulty: 0,
      status: "available", // available, active, completed
      likes: 32,
      category: "Архитектура",
      comments: [
        { id: 1, user: "Мария", text: "Лучше всего фотографировать на закате, когда меньше туристов.", avatar: null, date: "12.06.2023" },
        { id: 2, user: "Иван", text: "Рекомендую использовать широкоугольный объектив.", avatar: null, date: "15.06.2023" }
      ]
    },
    {
      idTask: 2,
      title: "Фотографии Парка Горького",
      description: "Соберите серию фотографий основных достопримечательностей Парка Горького.",
      latitude: 55.7298,
      longitude: 37.6013,
      difficulty: 0,
      status: "available",
      category: "Парки",
      likes: 45,
      comments: [
        { id: 3, user: "Александр", text: "В выходные много людей, лучше прийти рано утром.", avatar: null, date: "10.05.2023" }
      ]
    },
    {
      idTask: 3,
      title: "Фотографии экспонатов Третьяковской галереи",
      description: "Сделайте качественные фотографии разрешенных для съемки экспонатов Третьяковской галереи.",
      latitude: 55.7418,
      longitude: 37.6211,
      difficulty: 1,
      status: "available",
      category: "Музеи",
      likes: 28,
      comments: []
    },
    {
      idTask: 4,
      title: "Фотографии уличных артистов Арбата",
      description: "Создайте серию фотографий уличных музыкантов и художников на Арбате.",
      latitude: 55.7486,
      longitude: 37.5931,
      difficulty: 0,
      status: "available",
      category: "Культура",
      likes: 37,
      comments: [
        { id: 4, user: "Екатерина", text: "Обязательно спрашивайте разрешения перед съемкой у артистов.", avatar: null, date: "22.05.2023" }
      ]
    },
    {
      idTask: 5,
      title: "Фотографии фасада Большого театра",
      description: "Сделайте художественные фотографии фасада Большого театра в разное время суток.",
      latitude: 55.7601,
      longitude: 37.6186,
      difficulty: 2,
      status: "available",
      category: "Архитектура",
      likes: 53,
      comments: [
        { id: 5, user: "Сергей", text: "Вечернее освещение дает потрясающий эффект.", avatar: null, date: "05.06.2023" },
        { id: 6, user: "Ольга", text: "Со стороны фонтана получаются отличные кадры с отражением.", avatar: null, date: "08.06.2023" }
      ]
    }
  ];

  // Инициализация комментариев из задач
  useEffect(() => {
    const initialComments = {};
    mockTasks.forEach(task => {
      initialComments[task.idTask] = task.comments || [];
    });
    setComments(initialComments);
  }, []);

  // Check if user is logged in and initialize tasks with saved state
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsUserLoggedIn(loggedIn);
    
    // Load tasks state with saved tasks status from localStorage
    const savedLikedTasks = JSON.parse(localStorage.getItem('likedTasks') || '[]');
    
    // Mark tasks that are liked
    const tasksWithStatus = mockTasks.map(task => ({
      ...task,
      liked: savedLikedTasks.includes(task.idTask)
    }));
    
    setTasks(tasksWithStatus);
    
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Mocked user for testing
  useEffect(() => {
    // Simulating a logged-in user - in a real app this would come from auth context
    const mockUser = {
      id: 'user1',
      name: 'Александр Петров',
      email: 'alex@example.com',
      phone: '+7 (123) 456-7890',
      bio: 'Люблю путешествовать и изучать новые места',
      avatar: null
    };
    
    // Comment out the next lines to simulate logged out state
    setIsUserLoggedIn(true);
    setCurrentUser(mockUser);
    setUserProfileData(mockUser);
  }, []);

  // Function to handle liking tasks
  const handleToggleLike = (taskId) => {
    if (!isUserLoggedIn) {
      enqueueSnackbar('Требуется вход в систему', { variant: 'warning' });
      setAuthDialogOpen(true);
      return;
    }

    // Toggle like status in the tasks array
    setTasks(prev => prev.map(task => 
      task.idTask === taskId 
        ? { ...task, liked: !task.liked } 
        : task
    ));

    // Update liked tasks in localStorage
    const likedTasksInStorage = JSON.parse(localStorage.getItem('likedTasks') || '[]');
    let updatedLikedTasks;
    
    const task = tasks.find(t => t.idTask === taskId);
    if (task && !task.liked) {
      // If not currently liked, add to liked tasks
      updatedLikedTasks = [...likedTasksInStorage, taskId];
      enqueueSnackbar('Фотозадание сохранено', { variant: 'success' });
    } else {
      // If currently liked, remove from liked tasks
      updatedLikedTasks = likedTasksInStorage.filter(id => id !== taskId);
      enqueueSnackbar('Фотозадание удалено из сохраненных', { variant: 'info' });
    }
    
    // Save to localStorage
    localStorage.setItem('likedTasks', JSON.stringify(updatedLikedTasks));
  };

  const handleToggleMyTask = (taskId) => {
    if (!isUserLoggedIn) {
      enqueueSnackbar('Требуется вход в систему', { variant: 'warning' });
      setAuthDialogOpen(true);
      return;
    }

    // Toggle isMyTask status in the tasks array
    setTasks(prev => prev.map(task => 
      task.idTask === taskId 
        ? { ...task, isMyTask: !task.isMyTask } 
        : task
    ));

    // Mock API call to update task status
    mockUpdateTaskStatus(taskId, 'active')
      .then(() => {
        // Update myTasks in localStorage
        const myTasksInStorage = JSON.parse(localStorage.getItem('myTasks') || '[]');
        let updatedMyTasks;
        
        const task = tasks.find(t => t.idTask === taskId);
        if (task && !task.isMyTask) {
          // If not currently in myTasks, add to myTasks
          updatedMyTasks = [...myTasksInStorage, taskId];
          enqueueSnackbar('Задание добавлено в ваши задачи', { variant: 'success' });
        } else {
          // If currently in myTasks, remove from myTasks
          updatedMyTasks = myTasksInStorage.filter(id => id !== taskId);
          enqueueSnackbar('Задание удалено из ваших задач', { variant: 'info' });
        }
        
        // Save to localStorage
        localStorage.setItem('myTasks', JSON.stringify(updatedMyTasks));
      })
      .catch(error => {
        console.error('Error updating task status:', error);
        enqueueSnackbar('Ошибка при обновлении статуса задания', { variant: 'error' });
      });
  };

  const handleCenterUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          if (mapRef) {
            mapRef.setCenter([latitude, longitude], 14);
          }
        },
        () => alert('Не удалось получить ваше местоположение')
      );
    } else {
      alert('Geolocation не поддерживается вашим браузером');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    if (mapRef) {
      mapRef.setCenter([task.latitude, task.longitude], 14);
      // Show popup/balloon automatically for the selected task
      if (mapRef.balloon) {
        mapRef.balloon.open([task.latitude, task.longitude], renderToString(getTaskPopupContent(task)));
      }
    }
    
    // Initialize empty comments array if not exists
    if (!comments[task.idTask]) {
      setComments(prev => ({
        ...prev,
        [task.idTask]: task.comments || []
      }));
    }
    
    // Show both the task widget and comments widget
    setShowTaskWidget(true);
    setShowCommentsWidget(true);
  };

  const filteredTasks = searchQuery 
    ? tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;
  
  // Функция для лайка задания
  const handleLike = (taskId) => {
    // Проверяем, лайкал ли уже пользователь это задание
    if (likedTasks[taskId]) return;
    
    // Обновляем счетчик лайков
    setTasks(prev => prev.map(task => 
      task.idTask === taskId
        ? { ...task, likes: task.likes + 1 }
        : task
    ));
    
    // Отмечаем, что пользователь лайкнул это задание
    setLikedTasks(prev => ({ ...prev, [taskId]: true }));
  };

  // Функция для добавления комментария
  const handleAddCommentToTask = (taskId) => {
    if (!isUserLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для добавления комментария', { variant: 'warning' });
      setAuthDialogOpen(true);
      return;
    }
    
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: Date.now(),
      user: currentUser?.name || "Пользователь",
      text: newComment,
      avatar: currentUser?.avatar,
      date: new Date().toLocaleDateString()
    };
    
    // Update comments for task
    setComments(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newCommentObj]
    }));
    
    // Update task comments in state
    setTasks(prev => prev.map(task => 
      task.idTask === taskId
        ? { 
            ...task, 
            comments: [...(task.comments || []), newCommentObj] 
          }
        : task
    ));
    
    // Reset comment input
    setNewComment('');
    
    // Show a success message
    enqueueSnackbar('Комментарий добавлен', { variant: 'success' });
  };

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  // Profile settings handlers
  const handleProfileTabChange = (event, newValue) => {
    setProfileTabValue(newValue);
  };
  
  const handleToggleEditMode = () => {
    setProfileEditMode(!profileEditMode);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUserProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = () => {
    // In a real app, we would save to backend here
    setCurrentUser(userProfileData);
    setProfileEditMode(false);
  };
  
  const handleToggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };
  
  const handleLogout = () => {
    setIsUserLoggedIn(false);
    setCurrentUser(null);
    setProfileMenuAnchor(null);
  };
  
  const handleDeleteAccount = () => {
    // In a real app, we would call API to delete account
    setIsUserLoggedIn(false);
    setCurrentUser(null);
  };
  
  // Photo handling
  const handlePhotoSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result);
        // Update user data with new photo
        if (isUserLoggedIn) {
          setUserProfileData(prev => ({
            ...prev,
            avatar: reader.result
          }));
          
          // In a real app, we would upload the photo to server here
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Map resize handler
  useEffect(() => {
    const handleResize = () => {
      if (mapRef) {
        // Force map to redraw after resize
        setTimeout(() => {
          mapRef.container.fitToViewport();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapRef]);

  // Handle login button click
  const handleLoginClick = () => {
    setAuthDialogOpen(true);
    setAuthMode('login');
    // Reset form data
    setAuthData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Handle auth dialog close
  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
  };

  // Handle switching between login and register modes
  const handleAuthModeChange = (newMode) => {
    setAuthMode(newMode);
  };

  // Handle auth form input changes
  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit auth form
  const handleAuthSubmit = () => {
    setLoading(true);
    
    // Call API endpoints based on auth mode
    if (authMode === 'login') {
      // Login API call
      fetch('http://localhost:5234/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка входа');
        }
        return response.json();
      })
      .then(data => {
        // Save token and user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('authToken', data.token);
        
        // Update user state
        setIsUserLoggedIn(true);
        const mockUser = {
          id: data.userId,
          name: data.name || 'Пользователь',
          email: authData.email,
          phone: data.phone || '',
          bio: data.bio || 'Люблю путешествовать и изучать новые места',
          avatar: data.avatar || null
        };
        
        setCurrentUser(mockUser);
        setUserProfileData(mockUser);
        setAuthDialogOpen(false);
        enqueueSnackbar('Вы успешно вошли в систему', { variant: 'success' });
      })
      .catch(error => {
        console.error('Ошибка входа:', error);
        enqueueSnackbar('Ошибка входа: ' + error.message, { variant: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      // Register API call
      fetch('http://localhost:5234/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: authData.name,
          email: authData.email,
          password: authData.password
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка регистрации');
        }
        return response.json();
      })
      .then(data => {
        // Auto login after registration
        enqueueSnackbar('Регистрация успешна! Выполняется вход...', { variant: 'success' });
        
        // Simplified login after registration
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', data.userId);
        
        // Create user profile
        const newUser = {
          id: data.userId,
          name: authData.name,
          email: authData.email,
          phone: '',
          bio: '',
          avatar: null
        };
        
        setIsUserLoggedIn(true);
        setCurrentUser(newUser);
        setUserProfileData(newUser);
        setAuthDialogOpen(false);
      })
      .catch(error => {
        console.error('Ошибка регистрации:', error);
        enqueueSnackbar('Ошибка регистрации: ' + error.message, { variant: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
    }
    
    // Reset form data
    setAuthData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // Handle likes on blog posts
  const handleLikePost = (postId) => {
    // Check if user is logged in
    if (!isUserLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для добавления лайка', { variant: 'warning' });
      setAuthDialogOpen(true);
      return;
    }
    
    // Get the current state of the post
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Update posts state
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          } 
        : post
    ));
    
    // Persist liked posts in localStorage
    const likedPostsStr = localStorage.getItem('likedPosts') || '[]';
    let likedPosts = JSON.parse(likedPostsStr);
    
    if (!post.liked) {
      // Add to liked posts
      likedPosts.push(postId);
    } else {
      // Remove from liked posts
      likedPosts = likedPosts.filter(id => id !== postId);
    }
    
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  };

  // Update the task popup content to be more informative and visually appealing
  const getTaskPopupContent = (task) => {
    return (
      <Box sx={{ padding: 2, maxWidth: 300, overflow: 'hidden', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {task.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={task.category} 
            size="small" 
            sx={{ mr: 1 }} 
            color={
              task.category === 'Архитектура' ? 'primary' :
              task.category === 'Парки' ? 'success' :
              task.category === 'Музеи' ? 'secondary' :
              task.category === 'Культура' ? 'info' : 'default'
            }
          />
          <Chip 
            label={difficultyLabels[task.difficulty]} 
            size="small"
            color={difficultyColors[task.difficulty]}
          />
        </Box>
        
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {task.description}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
            {task.address || `${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}`}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Button 
            variant={task.isMyTask ? "outlined" : "contained"} 
            color={task.isMyTask ? "success" : "primary"}
            size="small"
            onClick={() => handleToggleMyTask(task.idTask)}
            sx={{ borderRadius: 4, textTransform: 'none' }}
          >
            {task.isMyTask ? "В моих задачах" : "Добавить в задачи"}
          </Button>
          
          <IconButton 
            size="small" 
            onClick={() => handleToggleLike(task.idTask)}
            color={task.liked ? "primary" : "default"}
          >
            {task.liked ? 
              <BookmarkIcon /> : 
              <BookmarkBorderIcon />
            }
          </IconButton>
        </Box>
        
        {task.comments && task.comments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Комментарии ({task.comments.length})
            </Typography>
            <List dense disablePadding>
              {task.comments.slice(0, 2).map((comment, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>{comment.user.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography variant="body2" fontWeight={500}>{comment.user}</Typography>}
                    secondary={<Typography variant="caption">{comment.text}</Typography>}
                  />
                </ListItem>
              ))}
              {task.comments.length > 2 && (
                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', mt: 0.5, display: 'block' }}>
                  Показать все комментарии...
                </Typography>
              )}
            </List>
          </Box>
        )}
      </Box>
    );
  };

  // Component for task list tab
  const TasksTab = () => {
    // Show all tasks without filtering by myTasks
    const filteredTasks = tasks.filter(task => {
      // Apply basic filtering if needed
      return true;
    });
      
    return (
      <Box sx={{ p: 2, height: 'calc(100vh - 56px)', overflow: 'auto' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">Задания по фотографированию</Typography>
        </Box>
        
        {filteredTasks.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <AssignmentLateIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Задачи не найдены
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredTasks.map(task => (
              <Card key={task.idTask} variant="outlined">
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                    </Box>
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {task.description.length > 100 
                      ? `${task.description.substring(0, 100)}...` 
                      : task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={task.category}
                        size="small"
                        color={
                          task.category === 'Архитектура' ? 'primary' :
                          task.category === 'Парки' ? 'success' :
                          task.category === 'Музеи' ? 'secondary' :
                          task.category === 'Культура' ? 'info' : 'default'
                        }
                        variant="outlined"
                      />
                      <Chip
                        label={difficultyLabels[task.difficulty]}
                        size="small"
                        color={difficultyColors[task.difficulty]}
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <IconButton
                        onClick={() => handleToggleLike(task.idTask)}
                        color={task.liked ? "primary" : "default"}
                        aria-label="like task"
                      >
                        <BookmarkIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setSelectedTask(task);
                          setActiveTab('map');
                          if (mapRef) {
                            mapRef.setCenter([task.latitude, task.longitude], 14);
                          }
                        }}
                        aria-label="view on map"
                      >
                        <MapIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // Bottom navigation
  const bottomNavRef = useRef(null);
  const [bottomNavHeight, setBottomNavHeight] = useState(56);
  
  useEffect(() => {
    if (bottomNavRef.current) {
      setBottomNavHeight(bottomNavRef.current.clientHeight);
    }
  }, []);
  
  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Main content area */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'hidden',
          pb: `${bottomNavHeight}px` // Add padding to accommodate the bottom nav
        }}
      >
        {activeTab === 'map' && (
          <YMaps query={{ apikey: 'ваш-api-ключ' }}>
            <Map
              defaultState={{
                center: [55.7558, 37.6173],
                zoom: 11,
                controls: ['zoomControl', 'fullscreenControl'],
              }}
              width="100%"
              height="100%"
              instanceRef={ref => setMapRef(ref)}
              modules={['control.ZoomControl', 'control.FullscreenControl', 'control.GeolocationControl']}
              onClick={closeAllWidgets}
            >
              <ZoomControl options={{ float: 'right' }} />
              <GeolocationControl 
                options={{ float: 'left' }}
                onClick={handleCenterUserLocation}
              />
              
              {/* User location marker */}
              {userLocation && (
                <Placemark
                  geometry={[userLocation.latitude, userLocation.longitude]}
                  options={{
                    preset: 'islands#blueCircleDotIcon',
                  }}
                  properties={{
                    hintContent: 'Ваше местоположение',
                  }}
                />
              )}
              
              {/* Task markers */}
              {tasks.map((task) => (
                <Placemark
                  key={task.idTask}
                  geometry={[task.latitude, task.longitude]}
                  options={{
                    preset: task.liked ? 'islands#redDotIcon' : 'islands#blueDotIcon',
                    openBalloonOnClick: true,
                    hideIconOnBalloonOpen: false
                  }}
                  properties={{
                    hintContent: task.title,
                    balloonContent: renderToString(getTaskPopupContent(task)),
                  }}
                  onClick={() => handleTaskClick(task)}
                />
              ))}
              
              {/* Search and filter button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  zIndex: 1000,
                  m: 1,
                }}
                onClick={() => setActiveTab('tasks')}
              >
                Поиск задач
              </Button>
            </Map>
          </YMaps>
        )}
        
        {activeTab === 'tasks' && <TasksTab />}
        
        {activeTab === 'profile' && (
          <Box sx={{ p: 2, height: 'calc(100vh - 56px)', overflow: 'auto' }}>
            <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
              Профиль
            </Typography>
            {!isUserLoggedIn ? (
              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Для доступа к профилю необходимо авторизоваться
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleLoginClick}
                >
                  Войти
                </Button>
              </Box>
            ) : (
              <Box>
                <Tabs value={profileTabValue} onChange={handleProfileTabChange}>
                  <Tab label="Профиль" />
                  <Tab label="Настройки" />
                </Tabs>
                
                {profileTabValue === 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar 
                        src={userProfileData.avatar} 
                        sx={{ width: 80, height: 80, mr: 2 }}
                      >
                        {userProfileData.name ? userProfileData.name.charAt(0) : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{userProfileData.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userProfileData.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {userProfileData.bio || 'Биография не указана'}
                    </Typography>
                  </Box>
                )}
                
                {profileTabValue === 1 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Настройки профиля
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Тема приложения
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightModeIcon sx={{ mr: 1, color: isDarkTheme ? 'text.disabled' : 'warning.main' }} />
                        <Switch 
                          checked={isDarkTheme}
                          onChange={handleToggleTheme}
                        />
                        <DarkModeIcon sx={{ ml: 1, color: isDarkTheme ? 'primary.main' : 'text.disabled' }} />
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{ mt: 1 }}
                    >
                      Выйти из аккаунта
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      {/* Bottom navigation */}
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
        ref={bottomNavRef}
      >
        <BottomNavigation
          value={activeTab}
          onChange={(event, newValue) => {
            setActiveTab(newValue);
          }}
          showLabels
        >
          <BottomNavigationAction
            label="Карта"
            value="map"
            icon={<MapIcon />}
          />
          <BottomNavigationAction
            label="Задачи"
            value="tasks"
            icon={<ListAltIcon />}
          />
          <BottomNavigationAction
            label="Профиль"
            value="profile"
            icon={<AccountCircleIcon />}
          />
        </BottomNavigation>
      </Paper>
      
      {/* Auth dialog */}
      <Dialog open={authDialogOpen} onClose={handleAuthDialogClose}>
        <DialogTitle>
          {authMode === 'login' ? 'Вход' : 'Регистрация'}
        </DialogTitle>
        <DialogContent>
          {authMode === 'register' && (
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Имя"
              type="text"
              fullWidth
              variant="outlined"
              value={authData.name}
              onChange={handleAuthInputChange}
            />
          )}
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={authData.email}
            onChange={handleAuthInputChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={authData.password}
            onChange={handleAuthInputChange}
          />
          {authMode === 'register' && (
            <TextField
              margin="dense"
              name="confirmPassword"
              label="Подтвердите пароль"
              type="password"
              fullWidth
              variant="outlined"
              value={authData.confirmPassword}
              onChange={handleAuthInputChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAuthDialogClose}>Отмена</Button>
          <Button onClick={handleAuthSubmit} variant="contained">
            {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </DialogActions>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          {authMode === 'login' ? (
            <Button onClick={() => handleAuthModeChange('register')}>
              Нет аккаунта? Зарегистрироваться
            </Button>
          ) : (
            <Button onClick={() => handleAuthModeChange('login')}>
              Уже есть аккаунт? Войти
            </Button>
          )}
        </Box>
      </Dialog>
      
      {/* Task info widget */}
      {selectedTask && showTaskWidget && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 170,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 400,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            zIndex: 1000,
            maxHeight: '30vh',
            overflowY: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {selectedTask.title}
            </Typography>
            <IconButton size="small" onClick={() => setShowTaskWidget(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={selectedTask.category} 
              size="small" 
              color={
                selectedTask.category === 'Архитектура' ? 'primary' :
                selectedTask.category === 'Парки' ? 'success' :
                selectedTask.category === 'Музеи' ? 'secondary' :
                selectedTask.category === 'Культура' ? 'info' : 'default'
              }
            />
            <Chip 
              label={difficultyLabels[selectedTask.difficulty]} 
              size="small"
              color={difficultyColors[selectedTask.difficulty]}
            />
          </Box>
          
          <Typography variant="body2" paragraph>
            {selectedTask.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {selectedTask.address || `${selectedTask.latitude.toFixed(4)}, ${selectedTask.longitude.toFixed(4)}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant={selectedTask.isMyTask ? "outlined" : "contained"}
              color={selectedTask.isMyTask ? "success" : "primary"}
              onClick={() => handleToggleMyTask(selectedTask.idTask)}
              startIcon={selectedTask.isMyTask ? <RemoveCircleOutlineIcon /> : <AddTaskIcon />}
            >
              {selectedTask.isMyTask ? "Удалить из задач" : "Добавить в задачи"}
            </Button>
            
            <Button
              variant="outlined"
              color={selectedTask.liked ? "primary" : "default"}
              startIcon={selectedTask.liked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              onClick={() => handleToggleLike(selectedTask.idTask)}
            >
              {selectedTask.liked ? "Сохранено" : "Сохранить"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Comments widget */}
      {selectedTask && showCommentsWidget && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: 400,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            zIndex: 1000,
            maxHeight: '30vh',
            overflowY: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Комментарии ({comments[selectedTask.idTask]?.length || 0})
            </Typography>
            <IconButton size="small" onClick={() => setShowCommentsWidget(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <List dense>
            {(comments[selectedTask.idTask] || []).map((comment, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ py: 1, px: 0 }}>
                <ListItemAvatar>
                  <Avatar>{comment.user.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {comment.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.date}
                      </Typography>
                    </Box>
                  }
                  secondary={<Typography variant="body2">{comment.text}</Typography>}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Добавить комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      edge="end" 
                      color="primary"
                      disabled={!newComment.trim()}
                      onClick={() => handleAddCommentToTask(selectedTask.idTask)}
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
} 