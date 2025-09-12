import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Chip, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { useSnackbar } from 'notistack';
import { fetchAllTasks } from '../services/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Add custom CSS to override Yandex Maps balloon styles
const customMapStyles = `
.ymaps-2-1-79-balloon__layout, 
.ymaps-2-1-79-balloon__content {
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
}

.ymaps-2-1-79-balloon__tail {
    display: none !important;
}

.ymaps-2-1-79-balloon__close {
    display: none !important;
}

.ymaps-2-1-79-balloon__close-button {
    display: none !important;
}

.ymaps-2-1-79-balloon {
    box-shadow: none !important;
}

.ymaps-2-1-79-balloon__content > ymaps {
    background-color: transparent !important;
    border: none !important;
    border-radius: 12px !important;
    overflow: visible !important;
}

.ymaps-2-1-79-balloon__layout {
    border-radius: 12px !important;
}
`;

const difficultyLabels = ['Легко', 'Средне', 'Сложно'];
const difficultyColors = ['success', 'warning', 'error'];

const MapPage = () => {
    const [tasks, setTasks] = useState([]);
    const [mapRef, setMapRef] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [activeBalloon, setActiveBalloon] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    // Inject custom CSS when component mounts
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = customMapStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Fetch tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const allTasks = await fetchAllTasks();
                // Make sure tasks is always an array
                setTasks(Array.isArray(allTasks) ? allTasks : []);
            } catch (error) {
                console.error('Error loading tasks:', error);
                // Don't show error messages to users for better UX
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Add a global balloon close method for the SVG close button to access
    useEffect(() => {
        // Make sure we clean up any global variables on unmount
        return () => {
            if (window.ymaps && window.ymaps.balloon) {
                delete window.ymaps.balloon;
            }
        };
    }, []);

    // Update the global balloon close method whenever activeBalloon changes
    useEffect(() => {
        if (mapRef && mapRef.balloon) {
            window.ymaps = window.ymaps || {};
            window.ymaps.balloon = {
                close: () => {
                    if (mapRef && mapRef.balloon && mapRef.balloon.isOpen()) {
                        mapRef.balloon.close();
                        setActiveBalloon(null);
                    }
                }
            };
        }
    }, [mapRef, activeBalloon]);

    // Function to generate balloon content
    const createBalloonContent = (task) => `
        <div style="font-family: Arial, sans-serif; padding: 16px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.5); max-width: 280px; background-color: #121212; color: rgba(255,255,255,0.9); border: 1px solid #2d2d2d; position: relative; margin: 0;">
            <div style="position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; background-color: rgba(33, 150, 243, 0.1); border-radius: 50%;" onclick="window.ymaps.balloon.close();">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="#2196f3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; color: white; font-weight: 600;">${task.title}</h2>
            
            <div style="display: inline-block; margin-bottom: 16px;">
                <span style="display: inline-block; font-size: 12px; padding: 4px 12px; border-radius: 14px; background-color: ${task.difficulty === 0 ? '#4caf50' : task.difficulty === 1 ? '#ff9800' : '#f44336'}; color: white; font-weight: 500;">
                    ${difficultyLabels[task.difficulty] || 'Неизвестно'}
                </span>
            </div>
            
            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5;">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
        </div>
    `;

    // Handle map click on a marker
    const handleTaskClick = (task) => {
        if (mapRef) {
            // Close any existing balloon first
            if (mapRef.balloon && mapRef.balloon.isOpen()) {
                mapRef.balloon.close();
                setActiveBalloon(null);
            }
            
            // Delay balloon opening to ensure only one appears
            setTimeout(() => {
                if (mapRef.balloon) {
                    try {
                        // Set options for the balloon
                        const balloonOptions = {
                            closeButton: false,  // Hide the default close button
                            shadow: false,
                            hasTail: false,
                            minWidth: 280,
                            maxWidth: 280,
                            minHeight: 180,
                            panelMaxMapArea: 0,
                            panelContentLayout: 'islands#blackContent'
                        };
                        
                        // Open the balloon
                        mapRef.balloon.open(
                            [task.latitude, task.longitude],
                            createBalloonContent(task),
                            balloonOptions
                        );
                        
                        // Store the active balloon reference
                        setActiveBalloon(task.idTask);
                    } catch (error) {
                        console.error("Error opening balloon:", error);
                    }
                }
            }, 100);
        }
    };

    // Handle showing task on the map
    const handleShowOnMap = (task) => {
        if (mapRef) {
            // Center the map on the task location
            mapRef.setCenter([task.latitude, task.longitude], 14);
            
            // Wait a moment for the map to finish centering
            setTimeout(() => {
                handleTaskClick(task);
            }, 200);
        }
    };

    const handleMapLoad = (mapInstance) => {
        setMapRef(mapInstance);
        setMapLoaded(true);
        
        // Initialize the global balloon close method
        window.ymaps = window.ymaps || {};
        window.ymaps.balloon = {
            close: () => {
                if (mapInstance && mapInstance.balloon && mapInstance.balloon.isOpen()) {
                    mapInstance.balloon.close();
                    setActiveBalloon(null);
                }
            }
        };
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            width: '100vw', 
            position: 'fixed',
            top: 0,
            left: 0,
            overflow: 'hidden'
        }}>
            {loading && (
                <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    p: 3,
                    borderRadius: 2
                }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2 }}>Загрузка задач...</Typography>
                </Box>
            )}

            {/* Search button */}
            <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 1000,
                    bgcolor: '#121212',
                    borderRadius: '30px',
                    padding: '10px 20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '1px solid #2d2d2d',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    '&:hover': {
                        bgcolor: '#1E1E1E',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                    },
                    '& .MuiSvgIcon-root': {
                        color: '#2196f3'
                    },
                    transition: 'all 0.2s ease'
                }}
                onClick={() => setSearchDialogOpen(true)}
            >
                Найти задания
            </Button>

            {/* Yandex Map - Always render the map */}
            <YMaps
                query={{
                    apikey: "APIKEY"
                }}
            >
                <Map
                    defaultState={{ center: [55.7558, 37.6173], zoom: 10 }}
                    instanceRef={handleMapLoad}
                    width="100%"
                    height="100%"
                    modules={['control.ZoomControl', 'templateLayoutFactory']}
                    options={{
                        suppressMapOpenBlock: true,
                        balloonPanelMaxMapArea: 0
                    }}
                    style={{
                        width: '100vw',
                        height: '100vh'
                    }}
                >
                    {mapLoaded && tasks && tasks.map((task) => (
                        <Placemark
                            key={task.idTask}
                            geometry={[task.latitude, task.longitude]}
                            options={{
                                preset: task.difficulty === 0 ? 'islands#greenDotIcon' : 
                                       task.difficulty === 1 ? 'islands#orangeDotIcon' : 
                                       'islands#redDotIcon',
                                iconColor: task.difficulty === 0 ? '#4caf50' : 
                                          task.difficulty === 1 ? '#ff9800' : 
                                          '#f44336',
                                balloonCloseButton: false,
                                hideIconOnBalloonOpen: false,
                                openBalloonOnClick: false,  // Disable automatic balloon opening
                                zIndexHover: 900
                            }}
                            onClick={() => {
                                // Handle the click manually
                                if (activeBalloon === task.idTask) {
                                    // If this balloon is already open, close it
                                    if (window.ymaps && window.ymaps.balloon) {
                                        window.ymaps.balloon.close();
                                    }
                                } else {
                                    // Otherwise, open this balloon
                                    handleTaskClick(task);
                                }
                            }}
                        />
                    ))}
                </Map>
            </YMaps>

            {/* Search dialog */}
            <Dialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        bgcolor: '#121212',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        border: '1px solid #2d2d2d',
                        color: 'white'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: '#121212', 
                    color: 'white',
                    borderBottom: '1px solid #2d2d2d',
                    px: 3,
                    py: 2
                }}>
                    Поиск заданий
                    <IconButton
                        aria-label="close"
                        onClick={() => setSearchDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 12,
                            top: 12,
                            color: 'rgba(255,255,255,0.7)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: 'white'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 2, bgcolor: '#121212', borderColor: '#2d2d2d' }}>
                    <Typography variant="body2" gutterBottom color="rgba(255,255,255,0.7)">
                        Найдено {tasks.length} заданий
                    </Typography>
                    
                    {tasks.map((task) => (
                        <Box 
                            key={task.idTask}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                p: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                borderRadius: 2,
                                mb: 2,
                                cursor: 'pointer',
                                bgcolor: '#1A1A1A',
                                border: '1px solid #2d2d2d',
                                '&:hover': {
                                    bgcolor: '#252525',
                                    borderColor: '#2196f3'
                                },
                                transition: 'background-color 0.2s ease, border-color 0.2s ease' 
                            }}
                            onClick={() => {
                                handleShowOnMap(task);
                                setSearchDialogOpen(false);
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography 
                                    variant="subtitle1" 
                                    fontWeight="bold" 
                                    color="white"
                                    sx={{
                                        textDecoration: 'none'
                                    }}
                                >
                                    {task.title}
                                </Typography>
                                <Chip 
                                    size="small" 
                                    label={difficultyLabels[task.difficulty] || 'Неизвестно'} 
                                    color={difficultyColors[task.difficulty] || 'default'}
                                    sx={{ fontWeight: 'medium' }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }} color="rgba(255,255,255,0.7)">
                                {task.description.substring(0, 100)}
                                {task.description.length > 100 ? '...' : ''}
                            </Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}>
                                <LocationOnIcon fontSize="inherit" sx={{ color: '#2196f3' }} />
                                {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}
                            </Typography>
                        </Box>
                    ))}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MapPage;
