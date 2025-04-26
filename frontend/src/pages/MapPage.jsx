import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { useSnackbar } from 'notistack';
import { fetchAllTasks } from '../services/api';

// Static marker icon
const taskMarkerIcon = "https://img.icons8.com/color/36/000000/camera.png";

const difficultyLabels = ['Легко', 'Средне', 'Сложно'];
const difficultyColors = ['success', 'warning', 'error'];

const MapPage = () => {
    const [tasks, setTasks] = useState([]);
    const [mapRef, setMapRef] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

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

    // Function to generate balloon content
    const createBalloonContent = (task) => `
        <div style="font-family: Arial, sans-serif; color: #333; background: #fff; padding: 10px; border-radius: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #4caf50;">${task.title}</h3>
            <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.3;">${task.description.substring(0, 80)}${task.description.length > 80 ? '...' : ''}</p>
            <p style="margin: 0; font-size: 11px; color: #777;"><b>Координаты:</b> ${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}</p>
        </div>
    `;

    // Handle map click on a marker
    const handleTaskClick = (task) => {
        if (mapRef && mapRef.balloon) {
            mapRef.balloon.open(
                [task.latitude, task.longitude],
                createBalloonContent(task)
            );
        }
    };

    // Handle showing task on the map
    const handleShowOnMap = (task) => {
        if (mapRef) {
            mapRef.setCenter([task.latitude, task.longitude], 14);
            
            setTimeout(() => {
                handleTaskClick(task);
            }, 100);
        }
    };

    const handleMapLoad = (mapInstance) => {
        setMapRef(mapInstance);
        setMapLoaded(true);
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
                    top: 10,
                    left: 10,
                    zIndex: 1000,
                    borderRadius: 20,
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    fontSize: '0.875rem',
                    bgcolor: '#4caf50',
                    '&:hover': {
                        bgcolor: '#43a047',
                    },
                    '@media (max-width: 768px)': {
                        fontSize: '0.75rem',
                        px: 1.5,
                        py: 0.3,
                        '& .MuiSvgIcon-root': {
                            fontSize: '1rem'
                        }
                    }
                }}
                onClick={() => setSearchDialogOpen(true)}
            >
                Поиск
            </Button>

            {/* Yandex Map - Always render the map, don't conditionally render based on loading state */}
            <YMaps>
                <Map
                    defaultState={{ center: [55.7558, 37.6173], zoom: 10 }}
                    instanceRef={handleMapLoad}
                    width="100%"
                    height="100%"
                    modules={['control.ZoomControl']}
                    options={{
                        suppressMapOpenBlock: true
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
                                iconLayout: 'default#image',
                                iconImageHref: taskMarkerIcon,
                                iconImageSize: [30, 30],
                                iconImageOffset: [-15, -30]
                            }}
                            onClick={() => handleTaskClick(task)}
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
                        bgcolor: '#1e1e1e',
                        color: '#fff',
                        p: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: { xs: '95vw', sm: '80vw', md: '500px' },
                        height: { xs: 'auto', sm: 'auto' },
                        maxHeight: '80vh',
                        margin: '0 auto',
                        overflow: 'hidden'
                    },
                }}
            >
                <DialogTitle sx={{ 
                    color: '#fff', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: { xs: 1, sm: 2 },
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Поиск задач</Typography>
                    <IconButton 
                        onClick={() => setSearchDialogOpen(false)}
                        sx={{ 
                            color: '#fff',
                            padding: { xs: '4px', sm: '8px' }
                        }}
                    >
                        <CloseIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: { xs: 1, sm: 2 }, overflow: 'auto' }}>
                    {tasks.length > 0 ? (
                        <Box>
                            {tasks.map((task) => (
                                <Box
                                    key={task.idTask}
                                    sx={{
                                        p: { xs: 1, sm: 2 },
                                        mb: { xs: 1, sm: 2 },
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 2,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.02)' },
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom sx={{ 
                                        fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                                        mb: { xs: 0.5, sm: 1 }
                                    }}>
                                        {task.title}
                                    </Typography>
                                    <Typography variant="body2" paragraph sx={{ 
                                        mb: { xs: 0.5, sm: 1 },
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}>
                                        {task.description.length > 100
                                            ? `${task.description.substring(0, 100)}...`
                                            : task.description}
                                    </Typography>
                                    <Chip
                                        label={difficultyLabels[task.difficulty]}
                                        color={difficultyColors[task.difficulty]}
                                        size="small"
                                        sx={{ 
                                            mb: 1,
                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                            height: { xs: '20px', sm: '24px' }
                                        }}
                                    />
                                    <Typography variant="body2">
                                        <IconButton
                                            onClick={() => {
                                                handleShowOnMap(task);
                                                setSearchDialogOpen(false);
                                            }}
                                            sx={{ color: '#fff' }}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                        Показать на карте
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                                Задачи не найдены или еще загружаются
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MapPage;