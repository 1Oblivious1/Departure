import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Tab, Tabs, Paper, Grid, 
  Card, CardContent, CardMedia, IconButton, Divider, Chip, Badge, LinearProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExploreIcon from '@mui/icons-material/Explore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import { motion, AnimatePresence } from 'framer-motion';

// Моковые данные профиля
const profileData = {
  name: 'Саня Человек',
  username: '@sanya',
  bio: 'Путешественник',
  location: 'Москва, Россия',
  website: 'travelwithsanya.com',
  verified: true,
  followers: 1258,
  following: 342,
  achievements: [
    { id: 1, name: 'Исследователь', icon: '🌎', level: 4, progress: 75 },
    { id: 2, name: 'Фотограф', icon: '📸', level: 3, progress: 60 },
    { id: 3, name: 'Путешественник', icon: '✈️', level: 5, progress: 100 }
  ],
  stats: [
    { name: 'Посещено стран', value: 35 },
    { name: 'Пройдено маршрутов', value: 87 },
    { name: 'Опубликовано отзывов', value: 156 }
  ]
};

// Моковые данные путешествий
const tripData = [
  {
    id: 1,
    title: 'Путешествие в Барселону',
    date: 'Июнь 2023',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
    likes: 245,
    saved: true
  },
  {
    id: 2,
    title: 'Исследование Токио',
    date: 'Март 2023',
    image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80',
    likes: 189,
    saved: false
  },
  {
    id: 3,
    title: 'Сафари в Танзании',
    date: 'Январь 2023',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
    likes: 312,
    saved: true
  },
  {
    id: 4,
    title: 'Поход в Альпы',
    date: 'Ноябрь 2022',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
    likes: 178,
    saved: false
  }
];

// Анимационные варианты
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    y: -10,
    boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const avatarVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    } 
  },
  tap: { scale: 0.95 }
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setUserData(profileData);
      setTrips(tripData);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleToggleSave = (id) => {
    setTrips(trips.map(trip => 
      trip.id === id ? { ...trip, saved: !trip.saved } : trip
    ));
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh' }}>
        <LinearProgress color="primary" />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      background: theme => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #121212 100%)' 
        : 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
      minHeight: '100vh'
    }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Фото профиля и информация */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 4, 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              height: 150, 
              width: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              bgcolor: 'primary.main',
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
            }} />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'center', sm: 'flex-end' }, 
              mt: { xs: 7, sm: 8 },
              position: 'relative'
            }}>
              <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                <motion.div whileHover="hover" variants={avatarVariants}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton 
                        size="small"
                        sx={{ 
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar 
                      src=""
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        border: '4px solid white',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                  </Badge>
                </motion.div>
              </Box>
              
              <Box sx={{ 
                ml: { xs: 0, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', sm: 'flex-start' },
                textAlign: { xs: 'center', sm: 'left' },
                flex: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {userData.name}
                  </Typography>
                  {userData.verified && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        delay: 0.2 
                      }}
                    >
                      <VerifiedIcon color="primary" sx={{ ml: 1 }} />
                    </motion.div>
                  )}
                </Box>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  {userData.username}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, maxWidth: 600 }}>
                  {userData.bio}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 2,
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  {userData.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {userData.location}
                      </Typography>
                    </Box>
                  )}
                  {userData.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LanguageIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {userData.website}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 2, sm: 3 },
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Box>
                    <Typography fontWeight={700}>{userData.followers}</Typography>
                    <Typography variant="body2" color="text.secondary">Подписчики</Typography>
                  </Box>
                  <Box>
                    <Typography fontWeight={700}>{userData.following}</Typography>
                    <Typography variant="body2" color="text.secondary">Подписки</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ 
                mt: { xs: 2, sm: 0 }, 
                display: 'flex', 
                gap: 1 
              }}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    variant="contained" 
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  >
                    Подписаться
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ borderRadius: 2 }}
                  >
                    Редактировать
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Paper>
        </motion.div>
        
        {/* Статистика и достижения */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 4
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Статистика
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'space-around'
                }}>
                  {userData.stats.map((stat, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Paper
                        elevation={1}
                        sx={{ 
                          p: 2,
                          borderRadius: 3,
                          textAlign: 'center',
                          minWidth: 150
                        }}
                      >
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.name}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Достижения
                </Typography>
                
                <Box>
                  {userData.achievements.map((achievement) => (
                    <Box key={achievement.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {achievement.icon}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {achievement.name} Уровень {achievement.level}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                          >
                            <LinearProgress 
                              variant="determinate" 
                              value={achievement.progress} 
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </motion.div>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.progress}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
        
        {/* Вкладки с путешествиями */}
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontWeight: 600
                }
              }}
            >
              <Tab 
                label="Посты" 
                icon={<ExploreIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Сохраненное" 
                icon={<BookmarkIcon />} 
                iconPosition="start"
              />
            </Tabs>
            
            <TabPanel value={activeTab} index={0}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Grid container spacing={3}>
                  {trips.map((trip) => (
                    <Grid item xs={12} sm={6} lg={3} key={trip.id}>
                      <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.4 }}
                            >
                              <CardMedia
                                component="img"
                                height={140}
                                image={trip.image}
                                alt={trip.title}
                              />
                            </motion.div>
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8,
                              zIndex: 1
                            }}>
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleSave(trip.id)}
                                  sx={{ 
                                    bgcolor: 'white',
                                    color: trip.saved ? 'primary.main' : 'action.active',
                                    '&:hover': { bgcolor: 'white' }
                                  }}
                                >
                                  <BookmarkIcon fontSize="small" />
                                </IconButton>
                              </motion.div>
                            </Box>
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Typography gutterBottom variant="subtitle1" fontWeight={600} component="div">
                              {trip.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {trip.date}
                            </Typography>
                          </CardContent>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            p: 1,
                            px: 2,
                            borderTop: 1,
                            borderColor: 'divider'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FavoriteIcon 
                                fontSize="small" 
                                sx={{ 
                                  color: 'error.main',
                                  mr: 0.5
                                }} 
                              />
                              <Typography variant="body2">
                                {trip.likes}
                              </Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1 }} />
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Chip 
                                label="Подробнее" 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                clickable
                              />
                            </motion.div>
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Здесь будут отображаться ваши сохраненные задания
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </motion.div>
      </motion.div>
    </Box>
  );
}

// Компонент панели вкладок
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: 16 }}
          {...other}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 