import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, CardActions, IconButton, TextField, 
  List, ListItem, ListItemText, Avatar, Chip, CircularProgress, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import AuthDialog from '../components/AuthDialog';

const mockFeed = [
  {
    id: 1,
    user: 'Иван',
    userAvatar: 'I',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    likes: 3,
    comments: ['Красиво!', 'Где это?'],
    timestamp: '2ч назад',
    location: 'Москва, Парк Горького'
  },
  {
    id: 2,
    user: 'Мария',
    userAvatar: 'M',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    likes: 5,
    comments: ['Вау!', 'Супер!'],
    timestamp: '5ч назад',
    location: 'Санкт-Петербург'
  },
  {
    id: 3,
    user: 'Алексей',
    userAvatar: 'A',
    image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=400&q=80',
    likes: 12,
    comments: ['Отличное место!', 'Надо посетить летом'],
    timestamp: '10ч назад',
    location: 'Сочи, Роза Хутор'
  },
  {
    id: 4,
    user: 'Елена',
    userAvatar: 'Е',
    image: 'https://images.unsplash.com/photo-1516398810565-0cb4310bb8ea?auto=format&fit=crop&w=400&q=80',
    likes: 8,
    comments: ['Очень атмосферно', 'Какое место?'],
    timestamp: '1д назад',
    location: 'Казань, Кремль'
  },
  {
    id: 5,
    user: 'Дмитрий',
    userAvatar: 'Д',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80',
    likes: 21,
    comments: ['Красота!', 'Нужно обязательно посетить'],
    timestamp: '2д назад',
    location: 'Байкал'
  }
];

// Анимации 
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20
    }
  }
};

const imageVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const heartVariants = {
  liked: { 
    scale: [1, 1.8, 1],
    transition: { 
      duration: 0.4,
      times: [0, 0.4, 1],
      ease: "easeInOut" 
    }
  }
};

const commentSectionVariants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.1 }
    }
  },
  expanded: { 
    height: "auto", 
    opacity: 1,
    transition: {
      height: { duration: 0.3 },
      opacity: { delay: 0.1, duration: 0.3 }
    }
  }
};

export default function FeedPage() {
  const [feed, setFeed] = useState(mockFeed);
  const [newComments, setNewComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [recentlyLiked, setRecentlyLiked] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Check if user is logged in on component mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLike = (id) => {
    if (!isLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для этого действия', { variant: 'warning' });
      setLastAction(() => () => handleLike(id));
      setAuthDialogOpen(true);
      return;
    }
    
    setRecentlyLiked(id);
    setTimeout(() => setRecentlyLiked(null), 600);
    
    setFeed(feed.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
    
    // Save liked posts to localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const post = feed.find(p => p.id === id);
    
    if (!post.liked) {
      // Add to liked posts
      if (!likedPosts.includes(id)) {
        localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, id]));
      }
      enqueueSnackbar('Добавлено в избранное', { variant: 'success' });
    } else {
      // Remove from liked posts
      localStorage.setItem('likedPosts', JSON.stringify(likedPosts.filter(postId => postId !== id)));
      enqueueSnackbar('Удалено из избранного', { variant: 'info' });
    }
  };

  const handleCommentChange = (id, value) => {
    setNewComments(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddComment = (id) => {
    if (!newComments[id] || !newComments[id].trim()) return;
    
    if (!isLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для комментирования', { variant: 'warning' });
      setLastAction(() => () => handleAddComment(id));
      setAuthDialogOpen(true);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setFeed(feed.map(post => 
        post.id === id 
          ? { ...post, comments: [...post.comments, newComments[id]] } 
          : post
      ));
      
      // Clear comment for this post
      setNewComments(prev => ({
        ...prev,
        [id]: ''
      }));
      
      setLoading(false);
      toggleExpandComments(id, true);
      enqueueSnackbar('Комментарий добавлен', { variant: 'success' });
    }, 300);
  };

  const toggleExpandComments = (postId, forceExpand = null) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: forceExpand !== null ? forceExpand : !prev[postId]
    }));
  };

  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    setAuthDialogOpen(false);
    
    if (lastAction) {
      lastAction();
      setLastAction(null);
    }
  };

  useEffect(() => {
    // Load liked and saved posts from localStorage on mount
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    
    setFeed(feed.map(post => ({
      ...post,
      liked: likedPosts.includes(post.id),
      bookmarked: savedPosts.includes(post.id)
    })));
  }, []);

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
        <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 3 }}>
          Лента новостей
        </Typography>
      </motion.div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {feed.map(post => (
          <motion.div key={post.id} variants={cardVariants}>
            <Card sx={{ 
              mb: 3, 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: theme => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0,0,0,0.4)' 
                : '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              {/* Card Header */}
              <Box sx={{ display: 'flex', p: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>{post.userAvatar}</Avatar>
                  </motion.div>
                  <Box sx={{ ml: 1.5 }}>
                    <Typography fontWeight={600}>{post.user}</Typography>
                    <Typography variant="caption" color="text.secondary">{post.location}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={post.timestamp} 
                    size="small" 
                    variant="outlined" 
                    sx={{ mr: 1, fontSize: 11, height: 24 }} 
                  />
                  <motion.div whileHover={{ rotate: 15 }} whileTap={{ scale: 0.9 }}>
                    <IconButton size="small">
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </motion.div>
                </Box>
              </Box>
              
              {/* Image */}
              <motion.div
                whileHover="hover"
                initial="initial"
                variants={imageVariants}
              >
                <CardMedia 
                  component="img" 
                  height={300} 
                  image={post.image} 
                  alt="news"
                  sx={{ objectFit: 'cover' }}
                />
              </motion.div>
              
              {/* Actions */}
              <CardActions sx={{ p: 1, pt: 1.5 }}>
                <motion.div
                  animate={recentlyLiked === post.id ? "liked" : ""}
                  variants={heartVariants}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconButton 
                    onClick={() => handleLike(post.id)} 
                    color="error"
                  >
                    {post.likes > 4 ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </motion.div>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  {post.likes}
                </Typography>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <IconButton 
                    sx={{ ml: 1 }} 
                    color={expandedComments[post.id] ? 'primary' : 'default'}
                    onClick={() => toggleExpandComments(post.id)}
                  >
                    <CommentIcon />
                  </IconButton>
                </motion.div>
                <Typography>{post.comments.length}</Typography>
              </CardActions>
              
              {/* Comments Section */}
              <AnimatePresence>
                <motion.div
                  initial="collapsed"
                  animate={expandedComments[post.id] ? "expanded" : "collapsed"}
                  variants={commentSectionVariants}
                  style={{ overflow: 'hidden' }}
                >
                  {expandedComments[post.id] && (
                    <CardContent sx={{ pt: 0, pb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Комментарии</Typography>
                      <List dense>
                        {post.comments.map((c, idx) => (
                          <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                            <ListItemText 
                              primary={<Typography variant="body2">{c}</Typography>} 
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Comment Input */}
              <Box sx={{ p: 2, pt: 0 }}>
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Добавить комментарий..."
                  fullWidth
                  value={newComments[post.id] || ''}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {loading ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                          >
                            <CircularProgress size={20} thickness={4} />
                          </motion.div>
                        ) : (
                          <motion.div 
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <IconButton 
                              edge="end" 
                              size="small"
                              disabled={!newComments[post.id] || !newComments[post.id].trim()}
                              onClick={() => handleAddComment(post.id)}
                              color="primary"
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </motion.div>
                        )}
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      <AuthDialog 
        open={authDialogOpen} 
        onClose={handleAuthDialogClose}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
} 