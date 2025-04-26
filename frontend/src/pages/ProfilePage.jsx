import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Tab, Tabs, Paper, Grid, 
  Card, CardContent, CardMedia, CardActions, IconButton, Divider, Chip, Badge, LinearProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemAvatar, ListItemText, 
  ListItemIcon, Menu, MenuItem, Tooltip, Accordion, AccordionSummary, AccordionDetails, CircularProgress, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ExploreIcon from '@mui/icons-material/Explore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LogoutIcon from '@mui/icons-material/Logout';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import StarIcon from '@mui/icons-material/Star';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskIcon from '@mui/icons-material/Task';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import { 
  getUserProfile, 
  getUserAchievements, 
  getUserFavorites, 
  getUserSubscriptions,
  getUserRating,
  subscribeToUser,
  unsubscribeFromUser,
  checkSubscriptionStatus,
  removeFromFavorites
} from '../services/api';
import noImagePlaceholder from '../assets/no-image';

// Animation variants
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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// FAQ Dialog Component
function FAQDialog({ open, onClose }) {
  if (!open) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: '8px', sm: '12px' },
          margin: { xs: 1, sm: 2 },
          maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' }
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: { xs: '1.1rem', sm: '1.5rem' },
        py: { xs: 1.5, sm: 2 }
      }}>
        Часто задаваемые вопросы (FAQ)
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <List>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Как начать выполнение задания?</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Перейдите на вкладку 'Задания', выберите интересующее задание и нажмите 'Начать выполнение'. После выполнения задания нажмите 'Завершить' и загрузите фотографию.</Typography>}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Как работает система рейтинга?</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>За каждое выполненное задание вы получаете очки в зависимости от сложности задания. Чем выше ваш рейтинг, тем выше вы в общем списке пользователей.</Typography>}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Как подписаться на других пользователей?</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Перейдите в профиль интересующего вас пользователя и нажмите кнопку 'Подписаться'.</Typography>}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Как сохранить публикацию?</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>В ленте или на странице публикации нажмите на иконку закладки. Сохраненные публикации будут доступны во вкладке 'Сохраненные' в вашем профиле.</Typography>}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: { xs: '0.9rem', sm: '1rem' } }}>Как удалить публикацию из сохраненных?</Typography>}
              secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Перейдите в свой профиль, откройте вкладку 'Сохраненные' и нажмите кнопку 'Удалить' на нужной публикации.</Typography>}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        <Button 
          onClick={onClose} 
          color="primary"
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 2, sm: 3 }
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, showAuthDialog, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [favorites, setFavorites] = useState({ posts: [] });
  const [subscriptionData, setSubscriptionData] = useState({ подписки: [], подписчики: [] });
  const [subscriptionStatus, setSubscriptionStatus] = useState(2); // 0=self, 1=subscribed, 2=not subscribed
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [subscriptionTab, setSubscriptionTab] = useState(0); // 0=followers, 1=following
  const [ratingData, setRatingData] = useState({ userRank: 0, rating: [] });
  const [showRating, setShowRating] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [postDetailsOpen, setPostDetailsOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Settings menu
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const settingsMenuOpen = Boolean(settingsAnchorEl);
  
  // Get current user ID and determine if we're looking at our own profile
  const currentUserId = user?.userId || null;
  const profileId = userId || currentUserId;
  
  // Multiple checks to ensure we correctly identify own profile
  const isOwnProfile = useMemo(() => {
    // No user logged in means definitely not own profile
    if (!currentUserId) return false;
    
    // Simple ID comparison (converting to strings to handle numeric vs string IDs)
    const idsMatch = currentUserId.toString() === profileId.toString();
    
    // If we already have profile data, check if the profile's ID matches current user
    const profileIdMatch = profileData?.профиль?.idUserProfilePublic 
      ? profileData.профиль.idUserProfilePublic.toString() === currentUserId.toString()
      : false;
    
    // Проверяем совпадения с данными из локального хранилища
    const storedUserId = localStorage.getItem('userId');
    const storedIdMatch = storedUserId ? storedUserId.toString() === profileId.toString() : false;
    
    // Если у нас уже есть ID из localStorage, используем его как дополнительный признак собственного профиля
    return idsMatch || profileIdMatch || storedIdMatch;
  }, [currentUserId, profileId, profileData]);
  
  // Diagnostic log to help troubleshoot profile ownership issues
  useEffect(() => {
    console.log('Profile ownership debug info:');
    console.log('Current user ID:', currentUserId);
    console.log('Profile ID from URL:', userId);
    console.log('Profile ID being used:', profileId);
    console.log('Profile ID from data:', profileData?.профиль?.idUserProfilePublic);
    console.log('Is own profile?', isOwnProfile);
  }, [currentUserId, userId, profileId, isOwnProfile, profileData]);

  const location = useLocation();

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleOpenFaq = () => {
    handleSettingsClose();
    setShowFaqDialog(true);
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
    handleSettingsClose();
  };

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleSettingsClose();
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.deleteAccount();
      enqueueSnackbar('Аккаунт успешно удален', { variant: 'success' });
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      enqueueSnackbar('Ошибка при удалении аккаунта', { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  // Function to specifically fetch user favorites
  const fetchUserFavorites = async (userId) => {
    if (!userId) {
      console.error('[ProfilePage] Cannot fetch favorites: userId is undefined or null');
      setFavorites({ posts: [] });
      return;
    }
    
    try {
      console.log(`[ProfilePage] Fetching favorites for user ${userId}`);
      setLoading(true);
      
      const favoritesData = await getUserFavorites(userId);
      console.log('[ProfilePage] Fetched favorites data:', favoritesData);
      
      // Ensure we have a valid structure even if the backend returns unexpected format
      let normalizedFavorites = { posts: [] };
      
      if (Array.isArray(favoritesData)) {
        // If backend returns array directly
        normalizedFavorites = { posts: favoritesData };
        console.log('[ProfilePage] Normalized array data to:', normalizedFavorites);
      } else if (favoritesData && typeof favoritesData === 'object') {
        // If backend returns object with posts property, or unknown structure
        if (Array.isArray(favoritesData.posts)) {
          normalizedFavorites = favoritesData;
          console.log('[ProfilePage] Using existing posts array:', normalizedFavorites);
        } else if (Object.keys(favoritesData).length > 0) {
          // If it's just a single post object
          normalizedFavorites = { posts: [favoritesData] };
          console.log('[ProfilePage] Converted single object to posts array:', normalizedFavorites);
        }
      }
      
      console.log('[ProfilePage] Final normalized favorites:', normalizedFavorites);
      
      // Дополнительно проверим, что posts существует и является массивом
      if (!normalizedFavorites.posts || !Array.isArray(normalizedFavorites.posts)) {
        console.warn('[ProfilePage] After normalization, posts is not an array. Setting to empty array.');
        normalizedFavorites.posts = [];
      }
      
      // Преобразование объектов в массиве для правильной работы с нужными полями
      normalizedFavorites.posts = normalizedFavorites.posts.map(post => {
        // Убедимся, что все нужные поля существуют с дефолтными значениями если нет
        return {
          idNewsFeed: post.idNewsFeed || post.id || 0,
          title: post.title || 'Без названия',
          description: post.description || 'Описание отсутствует',
          photoUrl: post.photoUrl || post.imageUrl || '',
          likes: post.likes || 0,
          comments: post.comments || []
        };
      });
      
      console.log('[ProfilePage] Posts after field normalization:', normalizedFavorites.posts);
      setFavorites(normalizedFavorites);
      
      // Если посты есть, то переключаемся на вкладку "Сохраненные"
      if (normalizedFavorites.posts.length > 0 && location.search.includes('favorites')) {
        setActiveTab(1);
      }
    } catch (error) {
      console.error('[ProfilePage] Error fetching favorites:', error);
      setFavorites({ posts: [] });
      // Не показываем пользователю сообщение об ошибке
    } finally {
      setLoading(false);
    }
  };

  // Extra effect to specifically refresh favorites when the user navigates back with the favorites parameter
  useEffect(() => {
    if (isOwnProfile && currentUserId && location.search.includes('favorites')) {
      console.log('Detected return to profile with favorites parameter - refreshing favorites');
      fetchUserFavorites(currentUserId);
      setActiveTab(1); // Switch to favorites tab
    }
  }, [location.search, currentUserId, isOwnProfile]);

  // Add this useEffect to initialize loading state correctly
  useEffect(() => {
    // If there's no profile ID and we're not waiting for the user to be loaded,
    // we should stop showing the loading spinner
    if (!profileId && !user?.loading) {
      setLoading(false);
    }
  }, [profileId, user]);

  // Fetch profile data and set up refresh when returning to the page
  useEffect(() => {
    // Only fetch if we have a valid profileId
    if (profileId) {
      console.log(`Fetching profile data with profileId: ${profileId}`);
      fetchProfileData();
      
      // Refresh favorites when this is the own profile and user navigates back to it
      if (isOwnProfile && currentUserId) {
        fetchUserFavorites(currentUserId);
      }
    } else if (user?.userId) {
      // If no profileId in URL but user is logged in, redirect to their profile
      console.log('No profileId provided, redirecting to user profile');
      // Добавляем небольшую задержку, чтобы убедиться, что пользовательские данные загружены
      setTimeout(() => {
        navigate(`/profile/${user.userId}`);
      }, 300);
    } else if (!user && !loading) {
      // Если пользователь не авторизован и загрузка завершена - редирект на главную страницу
      // Но добавляем проверку на наличие данных в localStorage
      const hasLocalStorageAuth = localStorage.getItem('token') && localStorage.getItem('userId');
      
      if (!hasLocalStorageAuth) {
        console.log('No valid profileId and no user logged in, redirecting to homepage');
        navigate('/');
      } else {
        console.log('Auth data found in localStorage, waiting for user data to load');
      }
    }
  }, [profileId, currentUserId, isOwnProfile, location.pathname, user, navigate, loading]);

  // Set initial active tab (important for when navigating from favorites in feed)
  useEffect(() => {
    // If URL contains a favorites parameter, switch to favorites tab
    if (location.search.includes('favorites')) {
      setActiveTab(1);
    }
  }, [location.search]);

  // Clear the previous profile data when the URL changes
  useEffect(() => {
    // Reset profile data when URL changes
    setProfileData(null);
    setAchievements([]);
    setFavorites({ posts: [] });
    setSubscriptionData({ подписки: [], подписчики: [] });
    
    // Don't immediately set loading or fetch data if no profile ID
    if (!profileId) {
      console.log('No profileId available, skipping profile data fetch');
      return;
    }
    
    fetchProfileData();
  }, [profileId, userId]); // Re-run when either profileId or userId from URL params changes
  
  const fetchProfileData = async () => {
    // Don't proceed if we don't have a valid profileId
    if (!profileId) {
      console.error('Cannot fetch profile data: profileId is undefined or null');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching profile data for ID: ${profileId}`);
      
      // Fetch profile data
      const profileData = await getUserProfile(profileId);
      console.log('Profile data received:', profileData);
      
      // Check both Latin and Cyrillic keys for compatibility
      if (!profileData || !(profileData.profile || profileData.профиль)) {
        console.error('Invalid profile data structure:', profileData);
        
        // Возможно проблема в авторизации - проверим наличие ID в localStorage
        const storedUserId = localStorage.getItem('userId');
        
        if (storedUserId && profileId.toString() === storedUserId.toString()) {
          console.log('User ID matches localStorage but profile data is invalid, attempting to reload');
          
          // В данном случае мы, вероятно, пытаемся загрузить собственный профиль, 
          // но токен авторизации недействителен или истек
          enqueueSnackbar('Необходимо повторно войти в аккаунт', { variant: 'warning' });
          
          // Очищаем данные авторизации
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          
          // Задержка перед перенаправлением, чтобы пользователь увидел уведомление
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
        
        // Don't show error to user, just log it
        setProfileData(null);
        setLoading(false);
        return;
      }
      
      // Map received data to expected structure
      const normalizedData = {
        профиль: profileData.profile || profileData.профиль,
        количество_подписчиков: profileData.subscribersCount || profileData.количество_подписчиков || 0,
        количество_подписок: profileData.subscriptionsCount || profileData.количество_подписок || 0,
        количество_выполненных_заданий: profileData.completedTasksCount || profileData.количество_выполненных_заданий || 0,
        общее_количество_лайков: profileData.totalLikes || profileData.общее_количество_лайков || 0,
        посты: profileData.posts || profileData.посты || []
      };
      
      // Ensure profile object has the expected fields
      if (normalizedData.профиль) {
        // Make sure name is available
        if (!normalizedData.профиль.name && normalizedData.профиль.имя) {
          normalizedData.профиль.name = normalizedData.профиль.имя;
        }
        
        // Make sure points are available
        if (!normalizedData.профиль.points && normalizedData.профиль.очки) {
          normalizedData.профиль.points = normalizedData.профиль.очки;
        }
      }
      
      setProfileData(normalizedData);
      
      // Safely fetch additional data with error handling for each request
      const fetchWithErrorHandling = async (fetchFn, defaultValue) => {
        try {
          return await fetchFn();
        } catch (error) {
          console.error('Error in fetch operation:', error);
          return defaultValue;
        }
      };
      
      // Fetch achievements
      const achievementsData = await fetchWithErrorHandling(
        () => getUserAchievements(profileId),
        []
      );
      setAchievements(achievementsData || []);
      
      // If own profile, fetch favorites
      if (isOwnProfile && currentUserId) {
        const favoritesData = await fetchWithErrorHandling(
          () => getUserFavorites(currentUserId),
          { posts: [] }
        );
        setFavorites(favoritesData || { posts: [] });
      }
      
      // Fetch subscription data
      const subscriptions = await fetchWithErrorHandling(
        () => getUserSubscriptions(profileId),
        { subscriptions: [], subscribers: [] }
      );
      
      const normalizedSubscriptions = {
        подписки: subscriptions?.subscriptions || subscriptions?.подписки || [],
        подписчики: subscriptions?.subscribers || subscriptions?.подписчики || []
      };
      setSubscriptionData(normalizedSubscriptions);
      
      // Check subscription status if not own profile
      if (!isOwnProfile && currentUserId) {
        const status = await fetchWithErrorHandling(
          () => checkSubscriptionStatus(currentUserId, profileId),
          2 // Default to not subscribed
        );
        setSubscriptionStatus(status);
      } else {
        // Explicitly set status to own profile (0)
        setSubscriptionStatus(0); 
        console.log('Setting subscription status to 0 (own profile)');
      }
      
      // Fetch rating data if we have a valid ID to use
      const ratingUserId = currentUserId || profileId;
      if (ratingUserId) {
        const rating = await fetchWithErrorHandling(
          () => getUserRating(ratingUserId),
          { userRank: 0, rating: [] }
        );
        
        // Normalize rating data
        const normalizedRating = {
          userRank: rating?.userRank || rating?.пользовательскийРанг || 0,
          rating: rating?.rating || rating?.рейтинг || []
        };
        
        setRatingData(normalizedRating);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Don't show errors to the user
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSubscribe = async () => {
    if (!currentUserId) {
      enqueueSnackbar('Необходимо войти в систему для подписки', { variant: 'warning' });
      return;
    }
    
    try {
      await subscribeToUser(currentUserId, profileId);
      // Update subscription status immediately to show UI change
      setSubscriptionStatus(1);
      
      // Update subscription counts
      const newData = { ...subscriptionData };
      // Add current user to followers if not already there
      if (!newData.подписчики.find(sub => sub.idUserProfilePublic === currentUserId)) {
        enqueueSnackbar('Вы подписались на пользователя', { variant: 'success' });
        
        // Refresh subscription data
        const subscriptions = await getUserSubscriptions(profileId);
        setSubscriptionData({
          подписки: subscriptions?.subscriptions || subscriptions?.подписки || [],
          подписчики: subscriptions?.subscribers || subscriptions?.подписчики || []
        });
      }
    } catch (error) {
      // Revert status on error
      setSubscriptionStatus(2);
      console.error('Error subscribing:', error);
      enqueueSnackbar('Ошибка при подписке', { variant: 'error' });
    }
  };
  
  const handleUnsubscribe = async () => {
    if (!currentUserId) return;
    
    try {
      await unsubscribeFromUser(currentUserId, profileId);
      // Update subscription status immediately to show UI change
      setSubscriptionStatus(2);
      
      // Update subscription counts
      const newData = { ...subscriptionData };
      // Remove current user from followers
      const followerIndex = newData.подписчики.findIndex(sub => sub.idUserProfilePublic === currentUserId);
      if (followerIndex !== -1) {
        newData.подписчики.splice(followerIndex, 1);
        setSubscriptionData(newData);
      }
      
      enqueueSnackbar('Вы отписались от пользователя', { variant: 'info' });
      
      // Refresh subscription data
      const subscriptions = await getUserSubscriptions(profileId);
      setSubscriptionData({
        подписки: subscriptions?.subscriptions || subscriptions?.подписки || [],
        подписчики: subscriptions?.subscribers || subscriptions?.подписчики || []
      });
    } catch (error) {
      // Revert status on error
      setSubscriptionStatus(1);
      console.error('Error unsubscribing:', error);
      enqueueSnackbar('Ошибка при отписке', { variant: 'error' });
    }
  };
  
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
    
    // Close dialogs if open
    setShowSubscriptions(false);
    setShowRating(false);
  };

  const handleViewFollowerProfile = (followerId) => {
    // Close dialog first if it's open
    setFollowersDialogOpen(false);
    
    // Use setTimeout to ensure dialog is closed before navigation
    setTimeout(() => {
      navigate(`/profile/${followerId}`);
    }, 50);
  };

  const handleViewFollowingProfile = (followingId) => {
    // Close dialog first if it's open
    setFollowingDialogOpen(false);
    
    // Use setTimeout to ensure dialog is closed before navigation
    setTimeout(() => {
      navigate(`/profile/${followingId}`);
    }, 50);
  };

  const handleViewPostAuthor = (userId) => {
    // Close any open dialogs first
    setPostDetailsOpen(false);
    
    // Use setTimeout to ensure dialog is closed before navigation
    setTimeout(() => {
      navigate(`/profile/${userId}`);
    }, 50);
  };

  const handleLogout = () => {
    logout();
    setLogoutConfirmOpen(false);
    enqueueSnackbar('Вы вышли из аккаунта', { variant: 'info' });
    navigate('/');
  };
  
  const handleEditProfile = () => {
    // Placeholder for edit profile functionality
    enqueueSnackbar('Редактирование профиля пока недоступно', { variant: 'info' });
  };

  const handleViewPostComments = (postId) => {
    // Navigate to feed with the post ID as a query parameter and comments expanded
    navigate(`/feed?post=${postId}&comments=expanded`);
  };
  
  // When removing a favorite, immediately refresh the list
  const handleRemoveFavorite = async (userId, postId) => {
    try {
      console.log(`Removing post ${postId} from favorites for user ${userId}`);
      await removeFromFavorites(userId, postId);
      enqueueSnackbar('Удалено из сохраненного', { variant: 'success' });
      
      // Immediately update the UI by removing the post
      setFavorites(prev => ({
        ...prev,
        posts: prev.posts.filter(post => post.idNewsFeed !== postId)
      }));
      
      // Also refresh the data from the server to ensure consistency
      fetchUserFavorites(userId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      enqueueSnackbar('Ошибка при удалении из сохраненного', { variant: 'error' });
    }
  };
  
  // Add this useEffect to load favorites when user is viewing their own profile
  useEffect(() => {
    // We only need to fetch favorites if we are viewing our own profile
    if (isOwnProfile && currentUserId) {
      console.log('[ProfilePage] Detected own profile, fetching favorites...');
      fetchUserFavorites(currentUserId);
    }
  }, [isOwnProfile, currentUserId]);
  
  // Add a separate useEffect to ensure favorites are loaded when the profile tab is selected
  useEffect(() => {
    if (activeTab === 1 && isOwnProfile && currentUserId) {
      console.log('[ProfilePage] Favorites tab selected, refreshing favorites...');
      fetchUserFavorites(currentUserId);
    }
  }, [activeTab, isOwnProfile, currentUserId]);
  
  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh' }}>
        <LinearProgress color="primary" />
      </Box>
    );
  }
  
  // If user not logged in and no specific profile requested
  if (!user && !userId) {
  return (
      <Box sx={{ p: 3, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
            <AccountCircleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Войдите в аккаунт
            </Typography>
            <Typography color="text.secondary" paragraph>
              Для просмотра профиля и доступа к персональным функциям необходимо войти в систему или зарегистрироваться.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => showAuthDialog(() => {})}
              sx={{ mt: 2 }}
            >
              Войти / Зарегистрироваться
            </Button>
          </Paper>
        </motion.div>
      </Box>
    );
  }
  
  // Profile not found - show login button instead of text
  if (!profileData || !profileData.профиль) {
    return (
      <Box sx={{ p: 3, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
            <AccountCircleIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Профиль не найден
            </Typography>
            <Typography color="text.secondary" paragraph>
              Возможно, профиль был удален или у вас нет доступа к нему. Вы можете вернуться на главную страницу или войти в свой аккаунт.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => showAuthDialog(() => {})}
              >
                Войти в аккаунт
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }
  
  // Requires login - show login button instead of profile
  if (profileData.профиль.requiresLogin) {
    return (
      <Box sx={{ p: 3, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
            <AccountCircleIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Требуется войти в аккаунт
            </Typography>
            <Typography color="text.secondary" paragraph>
              Для просмотра данного профиля и доступа к его содержимому необходимо авторизоваться.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => showAuthDialog(() => {})}
              >
                Войти в аккаунт
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }
  
  const { профиль, количество_подписчиков, количество_подписок, количество_выполненных_заданий, общее_количество_лайков, посты } = profileData;
  
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      bgcolor: 'background.default',
      py: { xs: 2, sm: 3 }
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ 
          width: '100%', 
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Фото профиля и информация */}
        <motion.div variants={itemVariants} style={{ width: '100%' }}>
          <Paper 
            elevation={2}
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              width: '100%',
              maxWidth: '1200px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Add the Settings Menu back */}
            <Menu
              anchorEl={settingsAnchorEl}
              open={settingsMenuOpen}
              onClose={handleSettingsClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={handleOpenFaq}>
                <HelpIcon fontSize="small" sx={{ mr: 1 }} />
                Помощь и FAQ
              </MenuItem>
              {user && (
                <>
                  <MenuItem onClick={handleLogoutClick}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Выйти
                  </MenuItem>
                  <MenuItem onClick={handleOpenDeleteConfirm}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
                    <Typography color="error">Удалить аккаунт</Typography>
                  </MenuItem>
                </>
              )}
            </Menu>

            <Box sx={{ 
              height: { xs: 100, sm: 150 }, 
              width: '100%', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              bgcolor: 'primary.main',
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
            }} />
            
            {/* Utility buttons on the purple background */}
            <Box sx={{ 
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              display: 'flex', 
              gap: 1,
              padding: 1
            }}>
              <Tooltip title="Уведомления">
                      <IconButton 
                        sx={{ 
                          color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }
                        }}
                  onClick={() => enqueueSnackbar('Функция уведомлений находится в разработке', { variant: 'info' })}
                      >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                      </IconButton>
              </Tooltip>
              
              <Tooltip title="Настройки">
                <IconButton 
                      sx={{ 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                  onClick={handleSettingsClick}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              </Box>
              
              <Box sx={{ 
                display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'center', sm: 'flex-start' },
              position: 'relative',
              zIndex: 1,
              mt: { xs: 5, sm: 10 }
            }}>
              <Avatar 
                src={profileData?.профиль?.avatarUrl || profileData?.профиль?.avatar || noImagePlaceholder}
                alt={profileData?.профиль?.name || 'User'}
                sx={{ 
                  width: { xs: 100, sm: 120 }, 
                  height: { xs: 100, sm: 120 }, 
                  border: '4px solid white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  mb: { xs: 2, sm: 0 }
                }}
                imgProps={{
                  onError: (e) => {
                    e.target.onerror = null;
                    e.target.src = noImagePlaceholder;
                  }
                }}
              />
              <Box sx={{ ml: { xs: 0, sm: 3 }, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {profileData?.профиль?.name || 'Loading...'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Chip 
                    icon={<StarIcon fontSize="small" />} 
                    label={`${profileData?.профиль?.points || 0} очков`} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  />
                  <Chip 
                    icon={<PeopleIcon fontSize="small" />} 
                    label={`${profileData?.количество_подписчиков || 0} подписчиков`} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  />
                  <Chip 
                    icon={<TaskIcon fontSize="small" />} 
                    label={`${profileData?.количество_выполненных_заданий || 0} заданий`} 
                    color="primary" 
                    variant="outlined"
                    size="small"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                  />
                </Box>
                
                {isOwnProfile || (user?.userId && user.userId.toString() === profileId.toString()) ? (
                  <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                      sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}
                      size="small"
                  >
                      Редактировать профиль
                  </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                  <Button 
                      variant="contained" 
                      color={subscriptionStatus === 1 ? "error" : "primary"}
                      startIcon={subscriptionStatus === 1 ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={subscriptionStatus === 1 ? handleUnsubscribe : handleSubscribe}
                      sx={{ mr: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 1 } }}
                      size="small"
                    >
                      {subscriptionStatus === 1 ? 'Отписаться' : 'Подписаться'}
                  </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </motion.div>
        
        {/* Stats and achievements section */}
        <motion.div variants={itemVariants} style={{ width: '100%' }}>
          <Box sx={{ 
            mt: 4,
            mb: 4,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              mb: 2, 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              display: 'flex',
              alignItems: 'center'
            }}>
              <BarChartIcon sx={{ mr: 1 }} /> Статистика и достижения
            </Typography>
            
                <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)' 
              },
                  gap: 2,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Achievements */}
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      Достижения
                    </Typography>
                  </Box>
                  
                  {achievements.length > 0 ? (
                    <Grid container spacing={1}>
                      {achievements.slice(0, 4).map((achievement, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Card 
                            elevation={0} 
                        sx={{ 
                          textAlign: 'center',
                              bgcolor: 'background.paper',
                              p: 1,
                              borderRadius: 2
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                width: { xs: 40, sm: 60 }, 
                                height: { xs: 40, sm: 60 }, 
                                margin: '0 auto',
                                bgcolor: 'primary.light' 
                              }}
                            >
                              <EmojiEventsIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                              {achievement.name || 'Достижение'}
                        </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Нет достижений
                        </Typography>
                  )}
                      </Paper>
              </Grid>
              
              {/* Stats */}
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    Статистика
                </Typography>
                
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>Выполненные задания</Typography>} 
                        secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>{`${profileData?.количество_выполненных_заданий || 0} заданий`}</Typography>} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <FavoriteIcon color="error" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>Полученные лайки</Typography>} 
                        secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>{`${profileData?.общее_количество_лайков || 0} лайков`}</Typography>} 
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PeopleIcon color="primary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>Подписки</Typography>} 
                        secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>{`${profileData?.количество_подписок || 0} подписок`}</Typography>} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Friends */}
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    Подписчики
                        </Typography>
                  
                  {subscriptionData?.подписчики?.length > 0 ? (
                    <List>
                      {subscriptionData.подписчики.slice(0, 3).map((subscriber, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ px: 0 }}
                          component="div"
                          onClick={() => handleViewFollowerProfile(subscriber.idUserProfilePublic)}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              src={subscriber.avatarUrl || noImagePlaceholder} 
                              alt={subscriber.name}
                              sx={{ width: { xs: 30, sm: 40 }, height: { xs: 30, sm: 40 } }}
                            />
                          </ListItemAvatar>
                          <ListItemText 
                            primary={<Typography variant="body1" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{subscriber.name}</Typography>} 
                            secondary={<Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Подписчик</Typography>} 
                          />
                        </ListItem>
                      ))}
                      {subscriptionData.подписчики.length > 3 && (
                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => setFollowersDialogOpen(true)}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            Показать всех ({subscriptionData.подписчики.length})
                          </Button>
                        </Box>
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Нет подписчиков
                        </Typography>
                  )}
                </Paper>
              </Grid>
                      </Box>
                    </Box>
        </motion.div>
        
        {/* Posts section */}
        <motion.div variants={itemVariants} style={{ width: '100%' }}>
          <Box sx={{ 
            mb: 3,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              mb: 2, 
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              display: 'flex',
              alignItems: 'center'
            }}>
              <PhotoLibraryIcon sx={{ mr: 1 }} /> Публикации
            </Typography>
            
          <Paper 
            elevation={2}
            sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
                centered
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                  bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '& .MuiTab-root': {
                    fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                    minWidth: { xs: 0, sm: 120 },
                    p: { xs: 1.5, sm: 2 },
                    flex: 1
                  },
                  width: '100%'
              }}
            >
              <Tab 
                  label="Публикации" 
                  icon={<PhotoLibraryIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} 
                iconPosition="start"
              />
              <Tab 
                  label="Сохраненные" 
                  icon={<BookmarkIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />} 
                iconPosition="start"
              />
            </Tabs>
            
            <TabPanel value={activeTab} index={0}>
                {profileData?.посты && profileData.посты.length > 0 ? (
                  <Box sx={{ 
                    px: { xs: 0, sm: 1 },
                    width: '100%',
                    boxSizing: 'border-box' 
                  }}>
                    <Grid container spacing={2} sx={{ 
                      width: '100%', 
                      mx: 0, 
                      boxSizing: 'border-box', 
                      '& .MuiGrid-item': {
                        paddingTop: '16px',
                        paddingLeft: '16px'
                      }
                    }}>
                      {profileData.посты.map((post, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index} sx={{ boxSizing: 'border-box' }}>
                        <Card 
                            elevation={3} 
                          sx={{ 
                              borderRadius: 3, 
                            overflow: 'hidden',
                              transition: 'transform 0.3s, box-shadow 0.3s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.12)'
                              }
                            }}
                          >
                            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                              <CardMedia
                                component="img"
                                height="180"
                                image={post.photoUrl || post.imageUrl || noImagePlaceholder}
                                alt={`Post ${index + 1}`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = noImagePlaceholder;
                                }}
                                sx={{
                                  transition: 'transform 0.5s ease',
                                  objectFit: 'contain',
                                  bgcolor: 'rgba(0,0,0,0.03)',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  },
                                  height: { xs: 150, sm: 180 }
                                }}
                              />
                            <Box sx={{ 
                              position: 'absolute', 
                                top: 10, 
                                right: 10, 
                                bgcolor: 'rgba(0,0,0,0.4)', 
                                color: 'white',
                                borderRadius: 5,
                                px: 1,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <FavoriteIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                  {post.likes || 0}
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 10, 
                                left: 10, 
                                bgcolor: 'rgba(0,0,0,0.4)', 
                                color: 'white',
                                borderRadius: 5,
                                px: 1,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <ChatIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                  {typeof post.comments === 'number' ? post.comments : post.comments?.length || 0}
                                </Typography>
                              </Box>
                            </Box>
                            <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2 } }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                {post.title || `Публикация ${index + 1}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                height: '4.5em',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}>
                                {post.description || 'Описание публикации...'}
                              </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', px: { xs: 1.5, sm: 2 }, pt: 0 }}>
                              <Button 
                                  size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate(`/feed?post=${post.idNewsFeed || post.id}`)}
                                  sx={{ 
                                  borderRadius: 2, 
                                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                  py: { xs: 0.5, sm: 1 }
                                }}
                              >
                                Подробнее
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                            </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Публикаций пока нет
                    </Typography>
                    {isOwnProfile && (
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{ mt: 2, borderRadius: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        size="small"
                      >
                        Создать публикацию
                      </Button>
                    )}
                          </Box>
                )}
              </TabPanel>
              
              <TabPanel value={activeTab} index={1}>
                {console.log('[ProfilePage] Rendering favorites tab, data:', favorites)}
                
                {!isOwnProfile ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Сохраненные публикации доступны только владельцу профиля
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      startIcon={<ExploreIcon />}
                      onClick={() => navigate('/feed')}
                      sx={{ mt: 2, borderRadius: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      size="small"
                    >
                      Перейти в ленту
                    </Button>
                  </Box>
                ) : favorites?.posts && Array.isArray(favorites.posts) && favorites.posts.length > 0 ? (
                  <Grid container spacing={2} sx={{ 
                    width: '100%', 
                    mx: 0, 
                    boxSizing: 'border-box',
                    '& .MuiGrid-item': {
                      paddingTop: '16px',
                      paddingLeft: '16px'
                    }
                  }}>
                    {favorites.posts.map((post, index) => {
                      console.log('[ProfilePage] Rendering favorite post:', post);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={index} sx={{ boxSizing: 'border-box' }}>
                          <Card 
                            elevation={3} 
                                sx={{ 
                              borderRadius: 3, 
                              overflow: 'hidden',
                              transition: 'transform 0.3s, box-shadow 0.3s',
                              '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.12)'
                              }
                            }}
                          >
                            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                              <CardMedia
                                component="img"
                                height="180"
                                image={post.photoUrl || noImagePlaceholder}
                                alt={`Favorite ${index + 1}`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = noImagePlaceholder;
                                }}
                                sx={{
                                  transition: 'transform 0.5s ease',
                                  objectFit: 'contain',
                                  bgcolor: 'rgba(0,0,0,0.03)',
                                  '&:hover': {
                                    transform: 'scale(1.05)'
                                  },
                                  height: { xs: 150, sm: 180 }
                                }}
                              />
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 10, 
                                right: 10, 
                                bgcolor: 'rgba(0,0,0,0.4)', 
                                color: 'white',
                                borderRadius: 5,
                                px: 1,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <FavoriteIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                  {post.likes || 0}
                              </Typography>
                            </Box>
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 10, 
                                left: 10, 
                                bgcolor: 'rgba(0,0,0,0.4)', 
                                color: 'white',
                                borderRadius: 5,
                                px: 1,
                                py: 0.5,
                                display: 'flex', 
                                alignItems: 'center'
                              }}>
                                <ChatIcon sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                                <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                  {typeof post.comments === 'number' ? post.comments : post.comments?.length || 0}
                                </Typography>
                              </Box>
                            </Box>
                            <CardContent sx={{ pb: 1, px: { xs: 1.5, sm: 2 } }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                {post.title || `Сохраненная публикация ${index + 1}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                height: '4.5em',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              }}>
                                {post.description || 'Описание публикации...'}
                              </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 2 }, pt: 0 }}>
                              <Button 
                                size="small" 
                                startIcon={<BookmarkIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                color="error"
                                variant="outlined"
                                onClick={() => handleRemoveFavorite(currentUserId, post.idNewsFeed)}
                                sx={{ 
                                  borderRadius: 2,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  py: { xs: 0.5, sm: 0.75 }
                                }}
                              >
                                Удалить
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined"
                                color="primary"
                                onClick={() => navigate(`/feed?post=${post.idNewsFeed || post.id}`)}
                                sx={{ 
                                  borderRadius: 2,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  py: { xs: 0.5, sm: 0.75 }
                                }}
                              >
                                Подробнее
                              </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                      );
                    })}
                </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Сохраненных публикаций пока нет
                </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      startIcon={<ExploreIcon />}
                      onClick={() => navigate('/feed')}
                      sx={{ mt: 2, borderRadius: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      size="small"
                    >
                      Перейти в ленту
                    </Button>
                    {isOwnProfile && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Вы можете сохранять понравившиеся публикации, нажав на иконку закладки в ленте
                      </Typography>
                    )}
              </Box>
                )}
            </TabPanel>
          </Paper>
          </Box>
        </motion.div>
      </motion.div>

      {/* Диалог подтверждения выхода из аккаунта */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        aria-labelledby="logout-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="logout-dialog-title" sx={{ fontSize: { xs: '18px', sm: '20px' } }}>
          Выйти из аккаунта?
        </DialogTitle>
        <DialogActions sx={{ padding: '0 24px 20px' }}>
          <Button onClick={() => setLogoutConfirmOpen(false)} sx={{ color: 'text.secondary' }}>
            Отмена
          </Button>
          <Button onClick={handleLogout} color="primary" autoFocus variant="contained">
            Выйти
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления аккаунта */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontSize: { xs: '18px', sm: '20px' } }}>
          Удалить аккаунт?
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Typography color="error" variant="body2" sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
            Это действие нельзя отменить. Все ваши данные будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px 20px' }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'text.secondary' }}>
            Отмена
          </Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAQ Dialog */}
      <FAQDialog 
        open={showFaqDialog} 
        onClose={() => setShowFaqDialog(false)} 
      />
    </Box>
  );
} 