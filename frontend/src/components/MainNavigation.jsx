import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Box, Badge } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FeedIcon from '@mui/icons-material/DynamicFeed';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion } from 'framer-motion';

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

export default function MainNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = navItems.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <Paper
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
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
          justifyContent: 'space-around',
          alignItems: 'center',
          minHeight: 65
        }}
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === activeTab;
          return (
            <Box
              component={motion.div}
              key={item.label}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate(item.path)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'text.secondary',
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                position: 'relative',
                minWidth: 60,
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {idx === 2 && (
                <Badge 
                  color="error" 
                  variant="dot" 
                  component={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10, 
                    delay: 0.5 
                  }}
                  sx={{ position: 'absolute', top: 6, right: 12 }} 
                />
              )}
              
              <motion.div variants={iconVariants}>
                <Icon sx={{ fontSize: 24, mb: 0.5 }} />
              </motion.div>
              
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  opacity: isActive ? 1 : 0.8
                }}
              >
                {item.label}
              </Box>
              
              <Box
                component={motion.div}
                initial="inactive"
                animate={isActive ? "active" : "inactive"}
                variants={indicatorVariants}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  height: 3,
                  borderRadius: 4,
                  bgcolor: 'primary.main'
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
} 