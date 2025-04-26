import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Button, Grid, CircularProgress, Snackbar, Alert, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Input, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import {
    fetchAllTasks,
    fetchUserTasks,
    getUserTaskIds,
    startTask,
    completeTask
} from '../services/api';
import noImagePlaceholder from '../assets/no-image';

const difficultyLabels = ['Легко', 'Средне', 'Сложно'];
const difficultyColors = ['success', 'warning', 'error'];

// Анимации
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08
    }
  }
};

const taskCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: { 
    y: -5, 
    boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  tap: { scale: 0.98 }
};

const buttonVariants = {
  hover: { 
    scale: 1.05, 
    boxShadow: "0px 6px 15px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: { scale: 0.95 }
};

const filterVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const filterButtonVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  hover: { 
    y: -2, 
    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: { y: 0, scale: 0.95 }
};

const TasksPage = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [userTasksData, setUserTasksData] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'myTasks'
    const [selectedTask, setSelectedTask] = useState(null);
    const [photoUrl, setPhotoUrl] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const { user, loading: authLoading } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Load tasks on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const allTasksData = await fetchAllTasks();
                setAllTasks(allTasksData);

                if (user?.userId) {
                    // Get user task IDs to know which tasks are already started
                    const taskIdsData = await getUserTaskIds(user.userId);
                    setActiveTasks(taskIdsData.activeTaskIds || []);
                    setCompletedTasks(taskIdsData.completedTaskIds || []);
                    
                    // Get user task details
                    const userTasks = await fetchUserTasks(user.userId);
                    setUserTasksData(userTasks);
                }
            } catch (error) {
                console.error('Ошибка загрузки задач:', error.message);
                enqueueSnackbar('Ошибка загрузки задач', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    // Filter tasks based on viewMode
    const getFilteredTasks = () => {
        if (viewMode === 'all') {
            return allTasks;
        } else if (viewMode === 'myTasks') {
            return userTasksData;
        }
        return [];
    };

    const handleStartTask = async (taskId) => {
        if (!user?.userId) {
            enqueueSnackbar('Требуется вход в систему для начала задания', { variant: 'warning' });
            return;
        }

        try {
            await startTask(user.userId, taskId);
            
            // Update active tasks list locally
            setActiveTasks(prev => [...prev, taskId]);
            
            // Reload user tasks
            const userTasks = await fetchUserTasks(user.userId);
            setUserTasksData(userTasks);
            
            enqueueSnackbar('Задание добавлено в ваши задания', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Ошибка при начале задания', { variant: 'error' });
        }
    };

    const handleOpenCompleteDialog = (task) => {
        setSelectedTask(task);
        setCompleteDialogOpen(true);
    };

    const handleCompleteTask = async () => {
        if (!photoUrl) {
            enqueueSnackbar('Необходимо добавить фото для завершения задания', { variant: 'warning' });
            return;
        }

        if (!taskDescription) {
            enqueueSnackbar('Необходимо добавить описание выполнения задания', { variant: 'warning' });
            return;
        }

        if (!selectedTask || !selectedTask.taskId) {
            enqueueSnackbar('Ошибка: не выбрано задание для завершения', { variant: 'error' });
            return;
        }

        if (!user || !user.userId) {
            enqueueSnackbar('Требуется войти в систему для выполнения задания', { variant: 'warning' });
            return;
        }

        try {
            setLoading(true);
            
            // Log the parameters being sent
            console.log('Completing task with params:', {
                userId: user.userId,
                taskId: selectedTask.taskId,
                photoUrl,
                description: taskDescription
            });
            
            // Make sure the taskId is a number or string, not an object
            const taskId = typeof selectedTask.taskId === 'object' 
                ? selectedTask.taskId.toString() 
                : selectedTask.taskId;
            
            await completeTask(user.userId, taskId, photoUrl, taskDescription);
            
            // Update completed tasks list locally
            setCompletedTasks(prev => [...prev, selectedTask.taskId]);
            setActiveTasks(prev => prev.filter(id => id !== selectedTask.taskId));
            
            // Reload user tasks
            const userTasks = await fetchUserTasks(user.userId);
            setUserTasksData(userTasks);
            
            setCompleteDialogOpen(false);
            setSelectedTask(null);
            setPhotoUrl('');
            setTaskDescription('');
            
            enqueueSnackbar('Задание успешно завершено!', { variant: 'success' });
        } catch (error) {
            console.error('Error completing task:', error);
            const errorMessage = error.message || 'Ошибка при завершении задания';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUrlChange = (e) => {
        setPhotoUrl(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setTaskDescription(e.target.value);
    };

    const renderTaskStatus = (taskId) => {
        if (completedTasks.includes(taskId)) {
            return (
                <Chip 
                    label="Выполнено" 
                    color="success" 
                    size="small" 
                    sx={{ mr: 1 }} 
                />
            );
        } else if (activeTasks.includes(taskId)) {
            return (
                <Box sx={{ display: 'flex', mt: 1 }}>
                    <Chip 
                        label="В процессе" 
                        color="primary" 
                        size="small" 
                        sx={{ mr: 1 }} 
                    />
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<PhotoCameraIcon />}
                        onClick={() => handleOpenCompleteDialog({
                            taskId: taskId,
                            title: allTasks.find(t => t.idTask === taskId)?.title || 'Задание'
                        })}
                    >
                        Завершить
                    </Button>
                </Box>
            );
        } else {
            return (
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleStartTask(taskId)}
                >
                    Начать выполнение
                </Button>
            );
        }
    };

    const filteredTasks = getFilteredTasks();

    return (
        <Box sx={{ p: 3, pb: 10, minHeight: '100vh' }}>
            <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                Задания
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                    <CircularProgress size={40} thickness={4} />
                </Box>
            ) : (
                <>
                    <Tabs
                        value={viewMode}
                        onChange={(_, newValue) => setViewMode(newValue)}
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Все задачи" value="all" />
                        <Tab label="Мои задачи" value="myTasks" />
                    </Tabs>

                    {filteredTasks.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography>
                                {viewMode === 'myTasks' ? 'У вас нет заданий.' : 'Задания не найдены.'}
                            </Typography>
                        </Box>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid container spacing={2}>
                                {filteredTasks.map(task => {
                                    const taskId = task.idTask || task.taskId;
                                    return (
                                        <Grid item xs={12} sm={6} md={4} key={taskId}>
                                            <motion.div
                                                variants={taskCardVariants}
                                                whileHover="hover"
                                            >
                                                <Box
                                                    sx={{
                                                        borderRadius: 2,
                                                        p: 2,
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        overflow: 'visible'
                                                    }}
                                                >
                                                    <Typography variant="h6" gutterBottom>
                                                        {task.title}
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                        sx={{ 
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word'
                                                        }}
                                                    >
                                                        {task.description}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            {`${task.latitude?.toFixed(4) || '?'}, ${task.longitude?.toFixed(4) || '?'}`}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={difficultyLabels[task.difficulty]}
                                                        color={difficultyColors[task.difficulty]}
                                                        size="small"
                                                        sx={{ mb: 2, alignSelf: 'flex-start' }}
                                                    />
                                                    
                                                    {/* Photo preview if available */}
                                                    {task.photoUrl && (
                                                        <Box sx={{ 
                                                            mt: 1, 
                                                            mb: 2, 
                                                            position: 'relative', 
                                                            height: 150,
                                                            bgcolor: 'action.hover', 
                                                            borderRadius: 2,
                                                            overflow: 'hidden'
                                                        }}>
                                                            <img 
                                                                src={task.photoUrl} 
                                                                alt="Completion photo" 
                                                                style={{ 
                                                                    width: '100%', 
                                                                    height: '100%', 
                                                                    objectFit: 'cover',
                                                                    borderRadius: 8
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = noImagePlaceholder;
                                                                }}
                                                            />
                                                        </Box>
                                                    )}
                                                    
                                                    <Box sx={{ mt: 'auto' }}>
                                                        {renderTaskStatus(taskId)}
                                                    </Box>
                                                </Box>
                                            </motion.div>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </motion.div>
                    )}
                </>
            )}

            {/* Complete Task Dialog */}
            <Dialog 
                open={completeDialogOpen} 
                onClose={() => setCompleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Завершить задание: {selectedTask?.title}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Для завершения задания, пожалуйста, добавьте URL фотографии и описание выполнения задания.
                    </Typography>
                    <TextField
                        autoFocus
                        label="URL фотографии"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={photoUrl}
                        onChange={handlePhotoUrlChange}
                        placeholder="https://example.com/photo.jpg"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Описание выполнения"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={taskDescription}
                        onChange={handleDescriptionChange}
                        placeholder="Опишите, как вы выполнили задание..."
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                    />
                    {photoUrl && (
                        <Box sx={{ mt: 2, textAlign: 'center', position: 'relative', bgcolor: 'action.hover', borderRadius: 2, p: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Предпросмотр:</Typography>
                            <img 
                                src={photoUrl} 
                                alt="Preview" 
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = noImagePlaceholder;
                                }}
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: 200,
                                    objectFit: 'contain',
                                    borderRadius: 8
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setCompleteDialogOpen(false);
                            setPhotoUrl('');
                            setTaskDescription('');
                        }}
                        disabled={loading}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleCompleteTask} 
                        variant="contained" 
                        disabled={!photoUrl || !taskDescription || loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Отправка...' : 'Завершить задание'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TasksPage;