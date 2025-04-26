import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, CardActions, IconButton, TextField, 
  List, ListItem, ListItemText, Avatar, Chip, CircularProgress, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import CommentIcon from '@mui/icons-material/Comment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ImageIcon from '@mui/icons-material/Image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getNewsFeed, 
  likePost, 
  addComment, 
  getPost,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} from '../services/api';

// Default image when none is available or loading fails
const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/400x300?text=No+Image';

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
    overflow: 'hidden',
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.1 }
    }
  },
  expanded: { 
    height: "auto", 
    opacity: 1,
    overflow: 'hidden',
    transition: {
      height: { duration: 0.3 },
      opacity: { delay: 0.1, duration: 0.3 }
    }
  }
};

export default function FeedPage() {
  const { user, showAuthDialog } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [favoriteLoading, setFavoriteLoading] = useState({});
  const [loadingFavorites, setLoadingFavorites] = useState({});
  const [recentlyLiked, setRecentlyLiked] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailsOpen, setPostDetailsOpen] = useState(false);

  // Cleanup function to prevent DOM manipulation issues when unmounting
  useEffect(() => {
    return () => {
      setExpandedComments({});
      setSelectedPost(null);
      setPostDetailsOpen(false);
    };
  }, []);

  // Fetch newsfeed on component mount
  useEffect(() => {
    fetchNewsFeed();
  }, []);

  // Handle URL parameters for opening specific posts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('post');
    const commentsParam = params.get('comments');
    
    if (postId) {
      // If feed is loaded, open the post
      if (feed.length > 0) {
        const post = feed.find(p => p.idNewsFeed === parseInt(postId) || p.idNewsFeed === postId);
        if (post) {
          setSelectedPost(post);
          setPostDetailsOpen(true);
          
          // If comments parameter is set to 'expanded', expand the comments section
          if (commentsParam === 'expanded') {
            setExpandedComments(prev => ({
              ...prev,
              [postId]: true
            }));
          }
        } else {
          // If post is not found in feed, fetch it
          handleViewPostDetails(postId);
        }
      } else if (!loading) {
        // If feed is not loaded but not loading, fetch the post directly
        handleViewPostDetails(postId);
      }
    }
  }, [feed, location.search, loading]);

  const fetchNewsFeed = async () => {
    setLoading(true);
    try {
      const data = await getNewsFeed();
      setFeed(data);
      
      // Check favorite status for each post if user is logged in
      if (user?.userId) {
        // Use Promise.allSettled to handle multiple requests and avoid unhandled rejections
        const statusPromises = data.map(post => {
          return checkFavoriteStatus(user.userId, post.idNewsFeed)
            .then(status => ({ postId: post.idNewsFeed, status }))
            .catch(() => ({ postId: post.idNewsFeed, status: 0 })); // Default to 0 (not favorite) on error
        });
        
        const results = await Promise.allSettled(statusPromises);
        
        // Update all favorites statuses at once
        const newFavorites = {};
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            newFavorites[result.value.postId] = result.value.status === 1;
          }
        });
        
        setFavoriteLoading(prev => ({
          ...prev,
          ...newFavorites
        }));
      }
    } catch (error) {
      console.error('Error fetching newsfeed:', error);
      // Don't show error messages to users for better UX
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user?.userId) {
      enqueueSnackbar('Требуется вход в систему для этого действия', { variant: 'warning' });
      showAuthDialog(() => handleLike(postId));
      return;
    }
    
    setRecentlyLiked(postId);
    setTimeout(() => setRecentlyLiked(null), 600);
    
    // Set loading state for this specific post
    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      const updatedPost = await likePost(postId);
      
      // Update the post in the feed
    setFeed(feed.map(post => 
        post.idNewsFeed === postId ? { ...post, likes: updatedPost.likes } : post
      ));
      
      enqueueSnackbar('Вы поставили лайк', { variant: 'success' });
    } catch (error) {
      console.error('Error liking post:', error);
      enqueueSnackbar('Ошибка при попытке лайкнуть пост', { variant: 'error' });
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentChange = (id, value) => {
    setComments(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleAddComment = async (postId) => {
    if (!comments[postId] || !comments[postId].trim()) return;
    
    if (!user?.userId) {
      enqueueSnackbar('Требуется вход в систему для комментирования', { variant: 'warning' });
      // Store comment content before showing auth dialog
      const commentText = comments[postId];
      
      // Pass an explicit callback function to be executed after successful login
      showAuthDialog(() => {
        // This callback will only be executed after authentication is complete
        // and the dialog has closed
        setComments(prev => ({
          ...prev,
          [postId]: commentText
        }));
        
        // Directly attempt to submit the comment without calling handleAddComment recursively
        // This avoids the recursion issue
        const submitSavedComment = async () => {
          if (!user?.userId) return; // Safety check
          
          setLoading(true);
          try {
            const updatedPost = await addComment(postId, user.userId, commentText);
            
            // Update the post in the feed
            setFeed(prevFeed => prevFeed.map(post => 
              post.idNewsFeed === postId ? { 
                ...post, 
                comments: Array.isArray(updatedPost.comments) ? updatedPost.comments : []
              } : post
            ));
            
            // Clear comment for this post
            setComments(prev => ({
              ...prev,
              [postId]: ''
            }));
            
            toggleExpandComments(postId, true);
            enqueueSnackbar('Комментарий добавлен', { variant: 'success' });
          } catch (error) {
            console.error('Error adding comment:', error);
            enqueueSnackbar('Ошибка при добавлении комментария', { variant: 'error' });
          } finally {
            setLoading(false);
          }
        };
        
        // Use a slight delay to ensure user state is updated
        setTimeout(submitSavedComment, 300);
      });
      return;
    }
    
    setLoading(true);
    try {
      const updatedPost = await addComment(postId, user.userId, comments[postId]);
      
      // Update the post in the feed
      setFeed(prevFeed => prevFeed.map(post => 
        post.idNewsFeed === postId ? { 
          ...post, 
          comments: Array.isArray(updatedPost.comments) ? updatedPost.comments : []
        } : post
      ));
      
      // Clear comment for this post
      setComments(prev => ({
        ...prev,
        [postId]: ''
      }));
      
      toggleExpandComments(postId, true);
      enqueueSnackbar('Комментарий добавлен', { variant: 'success' });
    } catch (error) {
      console.error('Error adding comment:', error);
      enqueueSnackbar('Ошибка при добавлении комментария', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandComments = (postId, forceExpand = null) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: forceExpand !== null ? forceExpand : !prev[postId]
    }));
  };

  const handleToggleFavorite = async (post) => {
    const postId = post.idNewsFeed;
    
    if (!user?.userId) {
      showAuthDialog();
      return;
    }

    const userId = user.userId;

    // Set loading state for this post
    setLoadingFavorites(prev => ({ ...prev, [postId]: true }));
    
    const currentStatus = post.favoriteStatus || 0;
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    // Optimistic update
    const updatedFeed = [...feed];
    const postIndex = updatedFeed.findIndex(p => p.idNewsFeed === postId);
    
    if (postIndex !== -1) {
      updatedFeed[postIndex] = {
        ...updatedFeed[postIndex],
        favoriteStatus: newStatus
      };
      setFeed(updatedFeed);
    }
    
    try {
      if (newStatus === 1) {
        console.log(`Adding post ${postId} to favorites for user ${userId}`);
        await addToFavorites(userId, postId);
        enqueueSnackbar('Добавлено в сохраненное', { 
          variant: 'success',
          action: (key) => (
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                navigate(`/profile/${userId}?favorites=true`);
              }}
            >
              Перейти в сохраненное
            </Button>
          )
        });
      } else {
        console.log(`Removing post ${postId} from favorites for user ${userId}`);
        await removeFromFavorites(userId, postId);
        enqueueSnackbar('Удалено из сохраненного', { variant: 'success' });
      }
      
      // Add URL parameter to track this action for when user returns to profile
      const url = new URL(window.location);
      url.searchParams.set('favorites', 'updated');
      window.history.replaceState({}, '', url);
      
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      
      // Revert the optimistic update
      if (postIndex !== -1) {
        updatedFeed[postIndex] = {
          ...updatedFeed[postIndex],
          favoriteStatus: currentStatus
        };
        setFeed(updatedFeed);
      }
      
      enqueueSnackbar(newStatus === 1 
        ? 'Ошибка при добавлении в сохраненное' 
        : 'Ошибка при удалении из сохраненного', 
        { variant: 'error' });
    } finally {
      // Reset loading state for this post
      setLoadingFavorites(prev => ({ ...prev, [postId]: false }));
      
      // Refresh the favorite status from the server to ensure UI is in sync
      if (user?.userId) {
        try {
          const serverStatus = await checkFavoriteStatus(userId, postId);
          console.log(`Server reports favorite status for post ${postId}: ${serverStatus}`);
          
          // Update feed with server status if different from what we expect
          if (serverStatus !== newStatus) {
            console.log(`Updating UI with server status: ${serverStatus}`);
            const refreshedFeed = [...feed];
            const refreshedPostIndex = refreshedFeed.findIndex(p => p.idNewsFeed === postId);
            
            if (refreshedPostIndex !== -1) {
              refreshedFeed[refreshedPostIndex] = {
                ...refreshedFeed[refreshedPostIndex],
                favoriteStatus: serverStatus
              };
              setFeed(refreshedFeed);
            }
          }
        } catch (statusError) {
          console.error('Error checking favorite status after update:', statusError);
        }
      }
    }
  };

  const handleViewPostDetails = async (postId) => {
    try {
      setLoading(true);
      const post = await getPost(postId);
      
      // First close any existing dialog to avoid DOM conflicts
      setPostDetailsOpen(false);
      
      // Use setTimeout to ensure proper sequence of state updates
      setTimeout(() => {
        setSelectedPost(post);
        setPostDetailsOpen(true);
        
        // Check if comments should be expanded
        const params = new URLSearchParams(location.search);
        const commentsParam = params.get('comments');
        if (commentsParam === 'expanded') {
          setExpandedComments(prev => ({
            ...prev,
            [postId]: true
          }));
        }
      }, 50);
    } catch (error) {
      console.error('Error fetching post details:', error);
      // Don't show error messages to user for better UX
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserProfile = (userId) => {
    if (!userId) {
      // Only log to console without displaying error to user
      console.error('Attempted to navigate to profile but userId is undefined or null');
      return;
    }
    
    // Close the post details dialog if it's open
    if (postDetailsOpen) {
      setPostDetailsOpen(false);
      
      // Use setTimeout to ensure dialog is closed before navigation
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 100);
    } else {
      // Navigate immediately if dialog is not open
      navigate(`/profile/${userId}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'только что';
    if (diffMins < 60) return `${diffMins}м назад`;
    if (diffHours < 24) return `${diffHours}ч назад`;
    if (diffDays < 7) return `${diffDays}д назад`;
    
    return date.toLocaleDateString();
  };

  // Function to handle image errors
  const handleImageError = (event) => {
    event.target.onerror = null; // Prevent infinite loops
    event.target.src = DEFAULT_IMAGE_URL;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
        <Typography variant="h5" fontWeight={700} color="primary" sx={{ mb: 3 }}>
          Лента новостей
        </Typography>

      {loading && feed.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      ) : feed.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Лента новостей пуста. Задания пока никто не выполняет.
          </Typography>
        </Box>
      ) : (
      <motion.div
        key="feed-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layout
      >
        <AnimatePresence mode="wait">
        {feed.map(post => (
            <motion.div 
              key={`post-${post.idNewsFeed}`} 
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              layout
            >
              <Card 
                elevation={3} 
                sx={{ 
              mb: 3, 
                  borderRadius: '16px',
              overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Avatar 
                      src={post.avatarUrl} 
                      alt={post.name} 
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: 'primary.light',
                        width: 42,
                        height: 42,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => handleViewUserProfile(post.idUserProfilePublic)}
                    >
                      {post.name ? post.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  <Box sx={{ ml: 1.5 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600} 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' } 
                        }}
                        onClick={() => handleViewUserProfile(post.idUserProfilePublic)}
                      >
                        {post.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="h6" fontWeight="bold">{post.title}</Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1.5, 
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '3.6em',
                        maxHeight: '4.5em'
                      }}
                    >
                      {post.description}
                    </Typography>
                </Box>
                  
                  <Chip 
                    label={post.difficulty === 0 ? 'Легко' : post.difficulty === 1 ? 'Средне' : 'Сложно'} 
                    size="small" 
                    color={post.difficulty === 0 ? 'success' : post.difficulty === 1 ? 'warning' : 'error'}
                    sx={{ 
                      mb: 1.5,
                      fontWeight: 500,
                      borderRadius: '12px',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </CardContent>
                
                <Box 
                  sx={{ 
                    position: 'relative',
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: 'action.hover'
                  }}
                  onClick={() => handleViewPostDetails(post.idNewsFeed)}
                >
              <motion.div
                    variants={imageVariants}
                    initial="initial"
                whileHover="hover"
              >
                <CardMedia 
                  component="img" 
                      image={post.photoUrl || DEFAULT_IMAGE_URL}
                      alt={post.title}
                      sx={{ 
                        width: '100%',
                        height: '300px',
                        objectFit: 'contain',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        transition: 'transform 0.3s ease-in-out',
                        '&.MuiCardMedia-img': {
                          objectPosition: 'center',
                        }
                      }}
                      onError={handleImageError}
                />
              </motion.div>
                </Box>
              
                <CardActions sx={{ px: 2, pt: 1, pb: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  variants={heartVariants}
                      animate={recentlyLiked === post.idNewsFeed ? 'liked' : ''}
                >
                  <IconButton 
                    color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.idNewsFeed);
                        }}
                        sx={{ 
                          borderRadius: '12px', 
                          p: 1, 
                          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' } 
                        }}
                        disabled={likeLoading[post.idNewsFeed]}
                      >
                        {likeLoading[post.idNewsFeed] ? (
                          <CircularProgress size={20} color="error" />
                        ) : (
                          <FavoriteIcon />
                        )}
                  </IconButton>
                </motion.div>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {post.likes || 0}
                    </Typography>
                    
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandComments(post.idNewsFeed);
                      }}
                      sx={{ 
                        borderRadius: '12px', 
                        p: 1, 
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' } 
                      }}
                    >
                      <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      {typeof post.comments === 'object' ? post.comments.length : post.comments || 0}
                </Typography>
                  </Box>
                    
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(post);
                    }}
                    disabled={loadingFavorites[post.idNewsFeed]}
                    sx={{
                      color: post.favoriteStatus === 1 ? 'primary.main' : 'text.secondary',
                      transition: 'transform 0.2s ease-in-out',
                      transform: post.favoriteStatus === 1 ? 'scale(1.2)' : 'scale(1)',
                      '&:hover': {
                        transform: post.favoriteStatus === 1 ? 'scale(1.3)' : 'scale(1.1)',
                      },
                    }}
                  >
                    {loadingFavorites[post.idNewsFeed] ? (
                      <CircularProgress size={20} />
                    ) : post.favoriteStatus === 1 ? (
                      <BookmarkIcon />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
              </CardActions>
              
                <div 
                  style={{ 
                    height: expandedComments[post.idNewsFeed] ? 'auto' : 0,
                    opacity: expandedComments[post.idNewsFeed] ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'height 0.3s ease, opacity 0.3s ease'
                  }}
                >
                  <Box sx={{ px: 2, pb: 2, overflow: 'hidden' }}>
                    {post.comments && post.comments.length > 0 && (
                      <List sx={{ py: 0, overflow: 'hidden', maxHeight: 'none' }}>
                        {post.comments.map((comment, index) => (
                          <ListItem 
                            key={comment.idComment || `comment-${post.idNewsFeed}-${index}`} 
                            sx={{ 
                              py: 1, 
                              px: 1.5, 
                              bgcolor: 'background.paper',
                              borderRadius: '12px',
                              mb: 1,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Box sx={{ display: 'flex', width: '100%' }}>
                              <Avatar 
                                src={comment.avatarUrl} 
                                alt={comment.authorName}
                                sx={{ 
                                  width: 36, 
                                  height: 36, 
                                  mr: 1.5, 
                                  cursor: 'pointer',
                                  bgcolor: 'primary.light'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewUserProfile(comment.idUserProfilePublic);
                                }}
                              >
                                {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      '&:hover': { color: 'primary.main' } 
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewUserProfile(comment.idUserProfilePublic);
                                    }}
                                  >
                                    {comment.authorName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(comment.submittedAt)}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                  {comment.text}
                                </Typography>
                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    )}
              
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Добавить комментарий..."
                        value={comments[post.idNewsFeed] || ''}
                        onChange={(e) => handleCommentChange(post.idNewsFeed, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px'
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                edge="end" 
                                color="primary"
                                disabled={loading || !comments[post.idNewsFeed]?.trim()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddComment(post.idNewsFeed);
                                }}
                              >
                                {loading ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <SendIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>
                  </Box>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      )}

      {/* Post Details Dialog */}
      <AnimatePresence mode="wait">
        {postDetailsOpen && selectedPost && (
          <Dialog
            key={`dialog-${selectedPost.idNewsFeed}`}
            open={postDetailsOpen}
            onClose={() => setPostDetailsOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                overflow: 'hidden'
              }
            }}
            TransitionProps={{
              onExited: () => {
                // Only clear selectedPost after animation completes
                if (!postDetailsOpen) {
                  setSelectedPost(null);
                }
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedPost.avatarUrl || DEFAULT_IMAGE_URL}
                  alt={selectedPost.name}
                  sx={{ mr: 1.5, cursor: 'pointer' }}
                  onClick={() => handleViewUserProfile(selectedPost.idUserProfilePublic)}
                  imgProps={{
                    onError: handleImageError
                  }}
                >
                  {selectedPost.name ? selectedPost.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': { color: 'primary.main' } 
                    }}
                    onClick={() => handleViewUserProfile(selectedPost.idUserProfilePublic)}
                  >
                    {selectedPost.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedPost.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                {selectedPost.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedPost.description}
              </Typography>
              <Box 
                component="img" 
                src={selectedPost.photoUrl || DEFAULT_IMAGE_URL} 
                alt={selectedPost.title}
                sx={{ 
                  width: '100%', 
                  maxHeight: 'none', 
                  objectFit: 'contain',
                  bgcolor: 'rgba(0,0,0,0.03)',
                  borderRadius: 1,
                  mb: 2 
                }}
                onError={handleImageError}
              />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Задание
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedPost.taskDescription}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {selectedPost.latitude && selectedPost.longitude 
                      ? `${selectedPost.latitude.toFixed(4)}, ${selectedPost.longitude.toFixed(4)}`
                      : 'Расположение неизвестно'}
                  </Typography>
                </Box>
                <Chip 
                  label={selectedPost.difficulty === 0 ? 'Легко' : selectedPost.difficulty === 1 ? 'Средне' : 'Сложно'} 
                  size="small" 
                  color={selectedPost.difficulty === 0 ? 'success' : selectedPost.difficulty === 1 ? 'warning' : 'error'}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Комментарии ({typeof selectedPost.comments === 'object' ? selectedPost.comments.length : selectedPost.comments || 0})
              </Typography>
              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                <List sx={{ py: 0, maxHeight: '400px', overflow: 'hidden' }}>
                  {selectedPost.comments.map((comment, index) => (
                    <ListItem 
                      key={comment.idComment || `detail-comment-${selectedPost.idNewsFeed}-${index}`} 
                      sx={{ 
                        py: 1, 
                        px: 1.5, 
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        mb: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Avatar 
                          src={comment.avatarUrl} 
                          alt={comment.authorName}
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            mr: 1.5, 
                            cursor: 'pointer',
                            bgcolor: 'primary.light'
                          }}
                          onClick={() => handleViewUserProfile(comment.idUserProfilePublic)}
                        >
                          {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main' } 
                              }}
                              onClick={(e) => handleViewUserProfile(comment.idUserProfilePublic)}
                            >
                              {comment.authorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(comment.submittedAt)}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {comment.text}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Нет комментариев
                </Typography>
              )}
              <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Добавить комментарий..."
                  value={comments[selectedPost.idNewsFeed] || ''}
                  onChange={(e) => handleCommentChange(selectedPost.idNewsFeed, e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                            <IconButton 
                              edge="end" 
                              color="primary"
                          disabled={loading || !comments[selectedPost.idNewsFeed]?.trim()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddComment(selectedPost.idNewsFeed);
                          }}
                        >
                          {loading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SendIcon />
                          )}
                            </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={selectedPost.favoriteStatus === 1 ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={() => handleToggleFavorite(selectedPost)}
                color={selectedPost.favoriteStatus === 1 ? "primary" : "inherit"}
              >
                {selectedPost.favoriteStatus === 1 ? 'В сохраненном' : 'Сохранить'}
              </Button>
              <Button onClick={() => setPostDetailsOpen(false)}>Закрыть</Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </Box>
  );
} 