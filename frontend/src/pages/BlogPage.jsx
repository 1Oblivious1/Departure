import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Card, CardContent, CardMedia, Avatar, 
  Chip, Button, IconButton, Skeleton, Pagination, InputBase, CardActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';

// Фиктивные данные блога
const mockBlogPosts = [
  {
    id: 1,
    title: 'Путешествие по исторической Москве',
    excerpt: 'Рассказ о скрытых маршрутах и локациях старой Москвы, которые стоит посетить...',
    content: 'Полный текст статьи о путешествии по исторической Москве. Москва — город с богатой историей, хранящий множество тайн и интересных мест. В этой статье мы рассмотрим необычные маршруты, которые помогут вам увидеть столицу с новой стороны.',
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80',
    author: 'Елена Соколова',
    authorAvatar: 'E',
    date: '15 мая 2023',
    category: 'История',
    readTime: '4 мин',
    likes: 45,
    saved: false
  },
  {
    id: 2,
    title: 'Лучшие приложения для туристов в 2023 году',
    excerpt: 'Обзор топ-10 приложений, которые должны быть установлены у каждого путешественника...',
    content: 'Полный обзор лучших приложений для путешественников в 2023 году. Современные технологии значительно упрощают процесс планирования и проведения путешествий. В этой статье мы рассмотрим самые полезные приложения, которые помогут вам спланировать маршрут, найти интересные места и сэкономить бюджет.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    author: 'Максим Петров',
    authorAvatar: 'M',
    date: '2 июня 2023',
    category: 'Технологии',
    readTime: '6 мин',
    likes: 78,
    saved: true
  },
  {
    id: 3,
    title: 'Экологический туризм: как путешествовать с заботой о природе',
    excerpt: 'Практические советы по организации экологичных путешествий без вреда для окружающей среды...',
    content: 'Подробное руководство по экологическому туризму. В эпоху изменения климата и роста экологических проблем, важно путешествовать ответственно. В этой статье мы поделимся советами, как минимизировать свой углеродный след во время путешествий и поддерживать локальные экосистемы.',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
    author: 'Анна Климова',
    authorAvatar: 'A',
    date: '18 июня 2023',
    category: 'Экология',
    readTime: '5 мин',
    likes: 62,
    saved: false
  },
  {
    id: 4,
    title: 'Путешествие с детьми: секреты спокойного отдыха',
    excerpt: 'Как организовать поездку с детьми так, чтобы она стала приятным опытом для всей семьи...',
    content: 'Полное руководство по организации путешествий с детьми. Семейные поездки могут быть стрессовыми, но с правильной подготовкой они превращаются в увлекательное приключение. В этой статье мы рассказываем, как планировать маршрут, развлекать детей в дороге и выбирать подходящие места для посещения.',
    image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&w=600&q=80',
    author: 'Ольга Смирнова',
    authorAvatar: 'O',
    date: '10 июля 2023',
    category: 'Семья',
    readTime: '8 мин',
    likes: 124,
    saved: false
  },
];

// Варианты анимаций
const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    y: -10,
    boxShadow: "0px 12px 30px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 8
    }
  },
  tap: { scale: 0.95 }
};

const chipVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 8
    }
  }
};

const searchBarVariants = {
  initial: { 
    width: "80%",
    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)" 
  },
  focus: { 
    width: "100%",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const BlogPage = () => {
  const [posts, setPosts] = useState(mockBlogPosts);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [expandedPost, setExpandedPost] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  useEffect(() => {
    // Имитация загрузки
    const timer = setTimeout(() => {
      setPosts(mockBlogPosts);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Load liked posts from localStorage on component mount
  useEffect(() => {
    // Check if user is logged in (simplified mock check)
    const userLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(userLoggedIn);
    
    if (userLoggedIn) {
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      
      // Update posts with liked status from localStorage
      const updatedPosts = posts.map(post => ({
        ...post,
        liked: likedPosts.includes(post.id)
      }));
      
      setPosts(updatedPosts);
    }
  }, []);
  
  const handleToggleSave = (id) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для сохранения поста', { variant: 'warning' });
      setAuthOpen(true);
      return;
    }
  
    setPosts(posts.map(post => 
      post.id === id ? { ...post, saved: !post.saved } : post
    ));
    
    // Save to localStorage
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    const post = posts.find(p => p.id === id);
    
    if (post) {
      const isCurrentlySaved = post.saved;
      let updatedSavedPosts;
      
      if (!isCurrentlySaved) {
        // Add to saved posts
        updatedSavedPosts = [...savedPosts, id];
      } else {
        // Remove from saved posts
        updatedSavedPosts = savedPosts.filter(postId => postId !== id);
      }
      
      localStorage.setItem('savedPosts', JSON.stringify(updatedSavedPosts));
    }
  };
  
  const handleToggleLike = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.likes + (post.liked ? -1 : 1), liked: !post.liked } : post
    ));
  };
  
  const handleExpandPost = (id) => {
    setExpandedPost(expandedPost === id ? null : id);
  };
  
  const handleLikePost = (postId) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      enqueueSnackbar('Требуется вход в систему для добавления лайка', { variant: 'warning' });
      setAuthOpen(true);
      return;
    }

    // Get liked posts from localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    
    // Update liked posts in localStorage
    let updatedLikedPosts;
    const isLiked = likedPosts.includes(postId);
    
    if (isLiked) {
      updatedLikedPosts = likedPosts.filter(id => id !== postId);
      enqueueSnackbar('Лайк удален', { variant: 'info' });
    } else {
      updatedLikedPosts = [...likedPosts, postId];
      enqueueSnackbar('Пост понравился!', { variant: 'success' });
    }
    
    localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));
    
    // Update posts state
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        const likesCount = post.likes + (newLiked ? 1 : -1);
        return { ...post, liked: newLiked, likes: likesCount };
      }
      return post;
    }));
  };
  
  const postsPerPage = 3;
  const pageCount = Math.ceil(posts.length / postsPerPage);
  const displayedPosts = posts.slice(
    (activePage - 1) * postsPerPage,
    activePage * postsPerPage
  );
  
  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      pb: 10, 
      background: theme => theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #121212 100%)' 
        : 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
      minHeight: '100vh'
    }}>
      <motion.div
        variants={fadeInUpVariant}
        initial="hidden"
        animate="visible"
      >
        <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 2 }}>
          Блог о путешествиях
        </Typography>
      </motion.div>
      
      <motion.div
        initial={searchBarVariants.initial}
        animate={searchFocused ? searchBarVariants.focus : searchBarVariants.initial}
        style={{ marginBottom: 20 }}
      >
        <Paper 
          elevation={2}
          sx={{ 
            display: 'flex',
            borderRadius: 4,
            px: 2,
            py: 0.5,
            mb: 3
          }}
        >
          <InputBase
            placeholder="Поиск статей..."
            sx={{ ml: 1, flex: 1 }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <IconButton>
            <SearchIcon />
          </IconButton>
        </Paper>
      </motion.div>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {['Все', 'История', 'Технологии', 'Экология', 'Семья', 'Путешествия'].map((category, index) => (
          <motion.div 
            key={category}
            variants={chipVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            custom={index}
          >
            <Chip 
              label={category} 
              color={index === 0 ? "primary" : "default"}
              variant={index === 0 ? "filled" : "outlined"}
              clickable
              sx={{
                fontWeight: 500,
                px: 1
              }}
            />
          </motion.div>
        ))}
      </Box>
      
      <motion.div
        variants={staggerContainerVariant}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          // Скелетон для загрузки
          Array.from(new Array(3)).map((_, index) => (
            <Card key={index} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
              <Skeleton variant="rectangular" height={200} animation="wave" />
              <CardContent>
                <Skeleton variant="text" height={30} width="80%" animation="wave" />
                <Skeleton variant="text" height={20} width="40%" animation="wave" />
                <Skeleton variant="text" height={100} animation="wave" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Отображение постов
          displayedPosts.map(post => (
            <motion.div
              key={post.id}
              variants={cardVariants}
              whileHover="hover"
            >
              <Card sx={{ 
                mb: 3, 
                borderRadius: 3, 
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <Box sx={{ position: 'relative' }}>
                  <motion.div variants={imageVariants} whileHover="hover">
                    <CardMedia
                      component="img"
                      height={240}
                      image={post.image}
                      alt={post.title}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleExpandPost(post.id)}
                    />
                  </motion.div>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    left: 16, 
                    display: 'flex', 
                    gap: 1 
                  }}>
                    <motion.div 
                      variants={chipVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <Chip 
                        label={post.category} 
                        color="primary" 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </motion.div>
                    <motion.div 
                      variants={chipVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <Chip 
                        label={post.readTime} 
                        size="small"
                        sx={{ fontWeight: 500, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                      />
                    </motion.div>
                  </Box>
                </Box>
                
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {post.authorAvatar}
                        </Avatar>
                      </motion.div>
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>{post.author}</Typography>
                        <Typography variant="caption" color="text.secondary">{post.date}</Typography>
                      </Box>
                    </Box>
                    <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                      <IconButton 
                        size="small"
                        onClick={() => handleToggleSave(post.id)}
                        color={post.saved ? "primary" : "default"}
                      >
                        {post.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </motion.div>
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    fontWeight={700} 
                    gutterBottom
                    onClick={() => handleExpandPost(post.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {post.title}
                  </Typography>
                  
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: expandedPost === post.id ? 'unset' : 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {expandedPost === post.id ? post.content : post.excerpt}
                  </Typography>
                  
                  <CardActions disableSpacing sx={{ pt: 0, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <IconButton 
                          aria-label="like post"
                          onClick={() => handleLikePost(post.id)}
                          color={post.liked ? "primary" : "default"}
                        >
                          {post.liked ? <ThumbUpIcon fontSize="small" /> : <ThumbUpOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </motion.div>
                      <Typography variant="body2" color="text.secondary">
                        {post.likes}
                      </Typography>
                    </Box>
                    <Box>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button 
                          size="small" 
                          startIcon={<ShareIcon />} 
                          sx={{ textTransform: 'none' }}
                        >
                          Поделиться
                        </Button>
                      </motion.div>
                    </Box>
                  </CardActions>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Pagination 
            count={pageCount} 
            page={activePage}
            onChange={(e, page) => setActivePage(page)}
            color="primary"
            size="large"
            sx={{
              '.MuiPaginationItem-root': {
                borderRadius: 2
              }
            }}
          />
        </motion.div>
      </Box>
    </Box>
  );
}

export default BlogPage; 