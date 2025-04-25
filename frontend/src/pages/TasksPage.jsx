import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Button, Grid, CircularProgress, Snackbar, Alert, Tab, Tabs } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import {
    fetchAllTasks,
    fetchUserTasks,
    startTask,
    completeTask,
    failTask
} from '../services/api';

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
    const [userTasks, setUserTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'myTasks'
    const { user, loading: authLoading } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    // Load tasks on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const allTasksData = await fetchAllTasks();
                setAllTasks(allTasksData);

                if (user?.userId) {
                    const userSubmissions = await fetchUserTasks(user.userId);
                    const userTaskIds = userSubmissions.map(submission => submission.idTask);
                    setUserTasks(userTaskIds);
                }
            } catch (error) {
                console.error('Ошибка загрузки задач:', error.message);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchTasks();
        }
    }, [user, authLoading]);

    // Filter tasks based on viewMode
    const filteredTasks = allTasks.filter(task => {
        if (viewMode === 'myTasks' && !userTasks.includes(task.idTask)) return false;
        return true;
    });

    const handleToggleMyTask = async (taskId) => {
        if (!user?.userId) {
            enqueueSnackbar('Требуется вход в систему для добавления задачи', { variant: 'warning' });
            return;
        }

        try {
            await startTask(user.userId, taskId);
            setUserTasks(prev => [...prev, taskId]);
            enqueueSnackbar('Задача добавлена в Мои задачи', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Ошибка добавления задачи', { variant: 'error' });
        }
    };

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
                                {viewMode === 'myTasks' ? 'У вас нет сохраненных задач.' : 'Задачи не найдены.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredTasks.map(task => (
                                <Grid item xs={12} sm={6} md={4} key={task.idTask}>
                                    <Box
                                        sx={{
                                            border: '1px solid #ddd',
                                            borderRadius: 2,
                                            p: 2,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            {task.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {task.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {`${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}`}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={difficultyLabels[task.difficulty]}
                                            color={difficultyColors[task.difficulty]}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />
                                        <Button
                                            fullWidth
                                            variant={userTasks.includes(task.idTask) ? 'contained' : 'outlined'}
                                            onClick={() => handleToggleMyTask(task.idTask)}
                                            disabled={userTasks.includes(task.idTask)}
                                        >
                                            {userTasks.includes(task.idTask) ? 'В моих задачах' : 'Добавить в мои задачи'}
                                        </Button>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
};

export default TasksPage;