import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  Link,
  Tooltip,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PhotoCamera, 
  PersonAdd, 
  Login, 
  QuestionAnswer,
  ArrowForward
} from '@mui/icons-material';

// Constants
const SURVEY_LINK = "https://docs.google.com/forms/d/17QnigYUoyhBFr2geBixffYAipLSIAdsPPkoj85al7sg/edit";
const DEFAULT_AVATAR_URL = 'https://ui-avatars.com/api/?name=User&background=random';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function AuthDialog() {
  const theme = useTheme();
  const dialogRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const { login, register, authDialogOpen, closeAuthDialog, handleAuthSuccess } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    mail: '',
    password: '',
    avatarUrl: DEFAULT_AVATAR_URL
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  useEffect(() => {
    if (authDialogOpen) {
      setFormData({
        name: '',
        mail: '',
        password: '',
        avatarUrl: DEFAULT_AVATAR_URL
      });
      setErrors({});
      setTabValue(0);
      setShowAvatarInput(false);
    }
  }, [authDialogOpen]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Map email field to mail for backend compatibility
    const fieldName = name === 'email' ? 'mail' : name;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName] || (fieldName === 'mail' && errors.email)) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null,
        ...(fieldName === 'mail' ? { email: null } : {})
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.mail) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.mail)) {
      newErrors.email = 'Неверный формат email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }
    
    if (tabValue === 1 && !formData.name) {
      newErrors.name = 'Имя обязательно';
    }
    
    // Optional validation for avatar URL if provided
    if (formData.avatarUrl && formData.avatarUrl !== DEFAULT_AVATAR_URL && !isValidUrl(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Пожалуйста, введите корректный URL изображения';
    }
    
    // Maximum length check to prevent database errors
    if (formData.avatarUrl && formData.avatarUrl.length > 250) {
      newErrors.avatarUrl = 'URL слишком длинный (максимум 250 символов)';
    }
    
    if (formData.name && formData.name.length > 50) {
      newErrors.name = 'Имя слишком длинное (максимум 50 символов)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simple URL validation
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (tabValue === 0) {
        // Login
        await login(formData.mail, formData.password);
        enqueueSnackbar('Вход выполнен успешно', { variant: 'success' });
      } else {
        // Ensure avatarUrl is populated
        if (!formData.avatarUrl) {
          formData.avatarUrl = DEFAULT_AVATAR_URL;
        }
        
        // Trim inputs to prevent length issues
        const trimmedData = {
          name: formData.name.trim().substring(0, 50),
          mail: formData.mail.trim(),
          password: formData.password,
          avatarUrl: formData.avatarUrl.trim().substring(0, 250)
        };
        
        // Register
        await register(trimmedData.name, trimmedData.mail, trimmedData.password, trimmedData.avatarUrl);
        enqueueSnackbar('Регистрация прошла успешно', { variant: 'success' });
      }
      
      // Handle successful auth
      handleAuthSuccess();
    } catch (error) {
      console.error('Auth error:', error);
      
      // Extract more specific error message if available
      let errorMessage;
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || error.response.data.title || error.message;
      } else {
        errorMessage = error.message || (tabValue === 0 ? 'Ошибка входа' : 'Ошибка регистрации');
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      closeAuthDialog();
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAvatarClick = () => {
    setShowAvatarInput(!showAvatarInput);
  };

  const handleSurveyClick = () => {
    window.open(SURVEY_LINK, '_blank');
  };

  // Don't render anything if dialog is not open to prevent DOM issues
  if (!authDialogOpen) return null;

  return (
    <Dialog 
      open={authDialogOpen} 
      onClose={handleClose}
      aria-labelledby="auth-dialog-title"
      maxWidth="sm"
      fullWidth
      ref={dialogRef}
      TransitionProps={{
        mountOnEnter: true,
        unmountOnExit: true
      }}
      PaperProps={{
        elevation: 12,
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          overflow: 'hidden',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.dark, 0.2)}`
        }
      }}
    >
      <DialogTitle id="auth-dialog-title" sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', 
        color: 'text.primary',
        p: 2,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
      }}>
        {tabValue === 0 ? 'Вход в аккаунт' : 'Создание аккаунта'}
      </DialogTitle>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant="fullWidth"
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200',
          '& .MuiTab-root': {
            color: 'text.secondary',
            fontWeight: 'bold',
            py: 1.5,
            transition: 'all 0.2s ease'
          },
          '& .Mui-selected': {
            color: 'primary.main'
          },
          '& .MuiTabs-indicator': {
            height: 3,
            backgroundColor: 'primary.main'
          }
        }}
      >
        <Tab icon={<Login />} label="Вход" iconPosition="start" />
        <Tab icon={<PersonAdd />} label="Регистрация" iconPosition="start" />
      </Tabs>
      
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ 
          p: 3, 
          bgcolor: 'background.paper'
        }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ py: 2 }}>
              <TextField
                margin="normal"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.mail}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.text.primary, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
                placeholder="example@mail.com"
                inputProps={{ maxLength: 100 }}
              />
              
              <TextField
                margin="normal"
                name="password"
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.text.primary, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {tabValue === 1 && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Avatar
                    src={formData.avatarUrl || DEFAULT_AVATAR_URL}
                    alt={formData.name || "User"}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto',
                      mb: 1,
                      cursor: 'pointer',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `2px solid ${theme.palette.primary.light}`
                    }}
                    onClick={handleAvatarClick}
                  />
                  <IconButton 
                    color="primary" 
                    aria-label="upload picture" 
                    component="span"
                    onClick={handleAvatarClick}
                    size="small"
                    sx={{ 
                      mt: -5, 
                      backgroundColor: theme.palette.background.paper, 
                      boxShadow: 2,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.light, 0.2),
                        color: 'primary.main'
                      }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                  
                  {showAvatarInput && (
                    <TextField
                      margin="dense"
                      name="avatarUrl"
                      label="URL Аватарки"
                      type="url"
                      fullWidth
                      variant="outlined"
                      value={formData.avatarUrl === DEFAULT_AVATAR_URL ? '' : formData.avatarUrl}
                      onChange={handleInputChange}
                      error={!!errors.avatarUrl}
                      helperText={errors.avatarUrl || "Оставьте пустым для аватара по умолчанию"}
                      placeholder="https://example.com/your-avatar.jpg"
                      disabled={loading}
                      sx={{ 
                        mt: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.text.primary, 0.2),
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  )}
                </Box>
              )}
              
              <TextField
                margin="normal"
                name="name"
                label="Имя"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                inputProps={{ maxLength: 50 }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.text.primary, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              />
              
              <TextField
                margin="normal"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.mail}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                inputProps={{ maxLength: 100 }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.text.primary, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              />
              
              <TextField
                margin="normal"
                name="password"
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.text.primary, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  startIcon={<QuestionAnswer />}
                  color="secondary"
                  variant="outlined"
                  onClick={handleSurveyClick}
                  sx={{ 
                    mt: 1,
                    borderRadius: 4,
                    px: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1)
                    }
                  }}
                >
                  Пройти опрос
                </Button>
              </Box>
            </Box>
          </TabPanel>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          pt: 1, 
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Button 
            onClick={handleClose} 
            color="primary" 
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            variant="contained" 
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
            disabled={loading}
            sx={{ 
              ml: 2,
              borderRadius: 2,
              px: 3,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                backgroundColor: theme.palette.primary.dark
              }
            }}
          >
            {tabValue === 0 ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AuthDialog;