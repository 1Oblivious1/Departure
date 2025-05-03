import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Box, Badge, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FeedIcon from '@mui/icons-material/DynamicFeed';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Карта', icon: MapIcon, path: '/map' },
  { label: 'Задания', icon: AssignmentIcon, path: '/tasks' },
  { label: 'Лента', icon: FeedIcon, path: '/feed' },
  { label: 'Профиль', icon: AccountCircleIcon, path: '/profile' },
];

// Варианты для анимаций
const iconVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.2, y: -4, transition: { type: "spring", stiffness: 400, damping: 10 } },
  tap: { scale: 0.9 }
};

const indicatorVariants = {
  inactive: { width: '0%', opacity: 0 },
  active: { 
    width: '40%', 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 15 
    } 
  }
};

const containerVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15, 
      when: "beforeChildren",
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
      damping: 15 
    }
  }
};

// FAQ Dialog Component
function FAQDialog({ open, onClose }) {
  if (!open) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Часто задаваемые вопросы (FAQ)</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText
              primary="Как начать выполнение задания?"
              secondary="Перейдите на вкладку 'Задания', выберите интересующее задание и нажмите 'Начать выполнение'. После выполнения задания нажмите 'Завершить' и загрузите фотографию."
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Как работает система рейтинга?"
              secondary="За каждое выполненное задание вы получаете очки в зависимости от сложности задания. Чем выше ваш рейтинг, тем выше вы в общем списке пользователей."
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Как подписаться на других пользователей?"
              secondary="Перейдите в профиль интересующего вас пользователя и нажмите кнопку 'Подписаться'."
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Как добавить пост в избранное?"
              secondary="В ленте новостей под каждым постом есть кнопка с иконкой закладки. Нажмите на нее, чтобы добавить пост в избранное."
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Как изменить информацию в профиле?"
              secondary="Перейдите в свой профиль и нажмите кнопку редактирования (иконка карандаша) рядом с вашим именем."
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

// Help Dialog Component
function HelpDialog({ open, onClose }) {
  if (!open) return null;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Помощь по приложению</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>Добро пожаловать в Departure!</Typography>
        <Typography paragraph>
          Это приложение помогает вам исследовать новые места, выполнять интересные задания и делиться своими достижениями с друзьями.
        </Typography>
        <Typography variant="h6" gutterBottom>Основные функции:</Typography>
        <Typography component="div">
          <List dense>
            <ListItem>
              <ListItemText primary="Карта - позволяет видеть все доступные задания на карте города" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Задания - список всех доступных заданий, которые можно начать выполнять" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Лента - новости о выполненных заданиях других пользователей" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Профиль - ваша персональная страница с информацией о достижениях" />
            </ListItem>
          </List>
        </Typography>
        <Typography paragraph>
          Если у вас возникли вопросы, обратитесь в раздел FAQ, где вы найдете ответы на часто задаваемые вопросы.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MainNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, showAuthDialog } = useAuth();
  const [faqOpen, setFaqOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  
  // Determine active tab
  const getActiveTabIndex = () => {
    const path = location.pathname;
    if (path.startsWith('/map')) return 0;
    if (path.startsWith('/tasks')) return 1;
    if (path.startsWith('/feed')) return 2;
    if (path.startsWith('/profile')) return 3;
    return -1;
  };
  
  const activeTab = getActiveTabIndex();

  // Handle navigation, directing to user's profile if profile tab is clicked
  const handleNavigation = (path, index) => {
    if (index === 3) {
      if (user && user.userId) {
        // Navigate to current user's profile
        navigate(`/profile/${user.userId}`);
      } else {
        // Show login dialog and navigate to profile after login
        console.log("Opening auth dialog from navigation");
        showAuthDialog(() => {
          console.log("Auth dialog callback executed"); 
          navigate(path);
        });
      }
    } else {
      navigate(path);
    }
  };

  // Show FAQ dialog
  const handleFaqClick = () => {
    setFaqOpen(true);
  };

  // Show Help dialog
  const handleHelpClick = () => {
    setHelpOpen(true);
  };

  // Simplify rendering when loading
  if (loading) {
    return (
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          p: 0.5,
          backdropFilter: 'blur(10px)',
          bgcolor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)'
        }}
        elevation={0}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 65
          }}
        >
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }

  return (
    <>
      {/* Bottom navigation - simplified structure */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          p: 0.5,
          backdropFilter: 'blur(10px)',
          bgcolor: theme => theme.palette.mode === 'dark' 
            ? 'rgba(18, 18, 18, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          width: '100%',
          maxWidth: '100vw',
          margin: 0,
          overflow: 'hidden'
        }}
        elevation={0}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            minHeight: 65,
            width: '100%',
            maxWidth: '100vw',
            overflow: 'hidden'
          }}
        >
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeTab;
            
            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  px: 1,
                  py: 1,
                  cursor: 'pointer',
                  color: isActive ? 'primary.main' : 'text.primary',
                  transition: 'color 0.2s'
                }}
                onClick={() => handleNavigation(item.path, idx)}
              >
                <Icon sx={{ fontSize: 24, mb: 0.5 }} />
                <Box
                  component="span"
                  sx={{
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    opacity: isActive ? 1 : 0.8,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  {item.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Dialogs */}
      <FAQDialog open={faqOpen} onClose={() => setFaqOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
} 