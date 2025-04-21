import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Button, Divider, Card, CardContent, IconButton, Tab, Tabs, CircularProgress, Badge, Grid, Skeleton, Snackbar, Alert, CardActions } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';

const difficultyLabels = ['Легко', 'Средне', 'Сложно'];
const difficultyColors = ['success', 'warning', 'error'];

// Фиктивные данные задач
const mockTasks = [
  {
    id: 1,
    idTask: 1,
    title: 'Помощь пожилым людям',
    description: 'Требуется помощь пожилым людям с покупками и доставкой продуктов',
    latitude: 55.751244,
    longitude: 37.618423,
    category: 'Волонтерство',
    difficulty: 0,
    isMyTask: false,
    liked: false,
    address: 'Москва, ул. Тверская, 1',
    price: 500
  },
  {
    id: 2,
    idTask: 2,
    title: 'Уборка парка',
    description: 'Организация уборки территории парка от мусора',
    latitude: 55.753215,
    longitude: 37.622504,
    category: 'Участие',
    difficulty: 1,
    isMyTask: false,
    liked: false,
    address: 'Москва, Парк Горького',
    price: 700
  },
  {
    id: 3,
    idTask: 3,
    title: 'Сбор вещей для нуждающихся',
    description: 'Сбор одежды, игрушек и других вещей для нуждающихся семей',
    latitude: 55.754124,
    longitude: 37.620169,
    category: 'Помощь',
    difficulty: 2,
    isMyTask: false,
    liked: false,
    address: 'Москва, ул. Пушкина, 10',
    price: 0
  }
];

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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'myTasks'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    
    // Load my tasks and liked tasks from localStorage
    const savedMyTasks = JSON.parse(localStorage.getItem('myTasks') || '[]');
    const savedLikedTasks = JSON.parse(localStorage.getItem('likedTasks') || '[]');
    
    // Mark tasks with the correct status based on localStorage
    const tasksWithStatus = mockTasks.map(task => ({
      ...task,
      isMyTask: savedMyTasks.includes(task.idTask),
      liked: savedLikedTasks.includes(task.idTask)
    }));
    
    setTasks(tasksWithStatus);
    
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Filter tasks based on viewMode and difficultyFilter
  const filteredTasks = tasks.filter(task => {
    // Filter by viewMode (all or myTasks)
    if (viewMode === 'myTasks' && !task.isMyTask) return false;
    
    // Apply difficulty filter if set
    if (difficultyFilter !== null && task.difficulty !== difficultyFilter) return false;
    
    return true;
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setExpandedCard(null);
  };

  const handleFilterDifficulty = (difficulty) => {
    setDifficultyFilter(difficulty === difficultyFilter ? null : difficulty);
    setExpandedCard(null);
  };

  const toggleCardExpand = (id) => {
    setExpandedCard(prev => prev === id ? null : id);
  };

  const handleToggleMyTask = (taskId) => {
    if (!isLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для добавления задачи', { variant: 'warning' });
      setAuthOpen(true);
      return;
    }

    const updatedTasks = tasks.map(task => {
      if (task.idTask === taskId) {
        const isMyTask = !task.isMyTask;
        return { ...task, isMyTask };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // Update myTasks in localStorage
    const myTaskIds = updatedTasks
      .filter(task => task.isMyTask)
      .map(task => task.idTask);
    
    localStorage.setItem('myTasks', JSON.stringify(myTaskIds));
    
    // Show notification
    const task = tasks.find(t => t.idTask === taskId);
    const isNowMyTask = !task.isMyTask;
    enqueueSnackbar(
      isNowMyTask 
        ? 'Задача добавлена в Мои задачи' 
        : 'Задача удалена из Моих задач', 
      { variant: isNowMyTask ? 'success' : 'info' }
    );
  };

  const handleToggleLike = (taskId) => {
    if (!isLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для добавления лайка', { variant: 'warning' });
      setAuthOpen(true);
      return;
    }

    // Get liked tasks from localStorage
    const likedTasks = JSON.parse(localStorage.getItem('likedTasks') || '[]');
    
    // Update liked tasks in localStorage
    let updatedLikedTasks;
    const isLiked = likedTasks.includes(taskId);
    
    if (isLiked) {
      updatedLikedTasks = likedTasks.filter(id => id !== taskId);
      enqueueSnackbar('Лайк удален', { variant: 'info' });
    } else {
      updatedLikedTasks = [...likedTasks, taskId];
      enqueueSnackbar('Задаче поставлен лайк!', { variant: 'success' });
    }
    
    localStorage.setItem('likedTasks', JSON.stringify(updatedLikedTasks));
    
    // Update tasks state
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.idTask === taskId) {
        const newLiked = !task.liked;
        return { ...task, liked: newLiked };
      }
      return task;
    }));
  };

  // Custom styled components
  const TaskCard = ({ task, isSaved, onToggle, isExpanded, onExpand }) => (
    <motion.div
      variants={taskCardVariants}
      whileHover="hover"
      whileTap="tap"
      layout
      onClick={() => onExpand(task.idTask)}
    >
      <Card
        elevation={isExpanded ? 3 : 1}
        sx={{
          mb: 2,
          borderRadius: 3,
          borderLeft: `6px solid ${difficultyColors[task.difficulty] ? 
            `var(--mui-palette-${difficultyColors[task.difficulty]}-main)` : 
            'var(--mui-palette-divider)'}`,
          cursor: 'pointer'
        }}
      >
        <CardContent sx={{ p: isExpanded ? 3 : 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>{task.title}</Typography>
              <Typography 
                color="text.secondary" 
                sx={{ 
                  mb: 2, 
                  maxHeight: isExpanded ? '200px' : '80px',
                  overflow: 'hidden',
                  opacity: isExpanded ? 1 : 0.9,
                  textOverflow: isExpanded ? 'initial' : 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: isExpanded ? 'initial' : 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {task.description}
              </Typography>
            </Box>
            <motion.div 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(task.idTask);
              }}
            >
              <IconButton 
                size="small" 
                color={isSaved ? 'primary' : 'default'}
                sx={{ mt: 0.5 }}
              >
                {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </motion.div>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip 
              label={difficultyLabels[task.difficulty]} 
              color={difficultyColors[task.difficulty]} 
              size="small" 
              sx={{ fontWeight: 500 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                {task.address || `${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}`}
              </Typography>
            </Box>
          </Box>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25
                }}
              >
                <Box sx={{ mt: 2 }}>
                  <motion.div
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonVariants}
                  >
                    <Button
                      variant={isSaved ? 'outlined' : 'contained'}
                      color={isSaved ? 'error' : 'primary'}
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task.idTask);
                      }}
                      sx={{
                        borderRadius: 8,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {isSaved ? 'Убрать из моих заданий' : 'Добавить в мои задания'}
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      pb: 10, 
      background: theme => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #121212 100%)' 
        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh' 
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          Задания
        </Typography>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          delay: 0.1
        }}
      >
        <Tabs 
          value={viewMode} 
          onChange={(_, newValue) => setViewMode(newValue)}
          variant="fullWidth" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3
            }
          }}
        >
          <Tab 
            label="Все задачи" 
            value="all" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: viewMode === 'all' ? 'bold' : 'normal', 
              fontSize: 15
            }} 
          />
          <Tab 
            label={
              <Badge 
                badgeContent={tasks.filter(task => task.isMyTask).length} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -15,
                  }
                }}
              >
                <Box sx={{ pr: 1 }}>Мои задачи</Box>
              </Badge>
            } 
            value="myTasks" 
            sx={{ 
              textTransform: 'none', 
              fontWeight: viewMode === 'myTasks' ? 'bold' : 'normal', 
              fontSize: 15 
            }} 
          />
        </Tabs>
      </motion.div>

      <motion.div
        variants={filterVariants}
        initial="initial"
        animate="animate"
      >
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <motion.div variants={filterButtonVariants} whileHover="hover" whileTap="tap">
            <Button 
              variant={difficultyFilter === null ? 'contained' : 'outlined'}
              color="inherit"
              startIcon={<FilterListIcon />}
              size="small"
              onClick={() => setDifficultyFilter(null)}
              sx={{ 
                borderRadius: 4, 
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Все
            </Button>
          </motion.div>

          {difficultyLabels.map((label, idx) => (
            <motion.div 
              key={idx} 
              variants={filterButtonVariants} 
              whileHover="hover" 
              whileTap="tap"
              custom={idx}
            >
              <Button 
                variant={difficultyFilter === idx ? 'contained' : 'outlined'}
                color={difficultyColors[idx]}
                size="small"
                onClick={() => handleFilterDifficulty(idx)}
                sx={{ 
                  borderRadius: 4, 
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                {label}
              </Button>
            </motion.div>
          ))}
        </Box>
      </motion.div>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
          >
            <CircularProgress size={40} thickness={4} />
          </motion.div>
        </Box>
      ) : (
        <>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15
              }}
            >
              <Box sx={{ 
                py: 4, 
                textAlign: 'center', 
                color: 'text.secondary',
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderRadius: 3
              }}>
                <Typography>
                  {viewMode === 'myTasks' ? 'У вас нет сохраненных задач. Добавьте задачи из общего списка.' : 'Задачи не найдены. Попробуйте изменить параметры поиска.'}
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={2}>
                {filteredTasks.map(task => (
                  <Grid item xs={12} sm={6} md={4} key={task.idTask} component={motion.div} variants={taskCardVariants}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        position: 'relative',
                        borderLeft: task.isMyTask ? '4px solid #4caf50' : 'none',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                      component={motion.div}
                      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {task.title}
                        </Typography>
                        
                        <Chip 
                          label={task.category} 
                          size="small" 
                          color={
                            task.category === 'Волонтерство' ? 'success' :
                            task.category === 'Помощь' ? 'primary' :
                            task.category === 'Участие' ? 'secondary' : 'default'
                          } 
                          sx={{ mb: 2 }} 
                        />
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {task.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {task.address || `${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={difficultyLabels[task.difficulty]} 
                            color={difficultyColors[task.difficulty]} 
                            size="small" 
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          size="small" 
                          color={task.isMyTask ? "success" : "primary"}
                          variant={task.isMyTask ? "contained" : "outlined"}
                          onClick={() => handleToggleMyTask(task.idTask)}
                          component={motion.button}
                          whileTap={{ scale: 0.95 }}
                        >
                          {task.isMyTask ? "В моих задачах" : "Добавить в мои задачи"}
                        </Button>
                        
                        <IconButton 
                          aria-label="like task" 
                          onClick={() => handleToggleLike(task.idTask)}
                          component={motion.button}
                          whileTap={{ scale: 0.9 }}
                          sx={{ ml: 'auto' }}
                        >
                          {task.liked ? 
                            <BookmarkIcon color="primary" /> : 
                            <BookmarkBorderIcon />
                          }
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </>
      )}
    </Box>
  );
}

export default TasksPage; 