import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { useSnackbar } from 'notistack';
import { fetchAllTasks } from '../services/api';

const taskMarkerIcon = "https://img.icons8.com/color/36/000000/camera.png";

const difficultyLabels = ['Легко', 'Средне', 'Сложно'];
const difficultyColors = ['success', 'warning', 'error'];

const MapPage = () => {
    const [tasks, setTasks] = useState([]);
    const [mapRef, setMapRef] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false); // Новое состояние для модального окна
    const { enqueueSnackbar } = useSnackbar();

    // Fetch tasks from API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const allTasks = await fetchAllTasks();
                setTasks(allTasks);
            } catch (error) {
                enqueueSnackbar('Ошибка загрузки задач', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Function to generate styled balloon content
    const createBalloonContent = (task) => `
        <div style="font-family: Arial, sans-serif; color: #fff; background: #1e1e1e; padding: 15px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 10px; font-size: 18px; color: #4caf50;">${task.title}</h3>
            <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.4;">${task.description}</p>
            <p style="margin: 0; font-size: 12px; color: #ccc;"><b>Координаты:</b> ${task.latitude.toFixed(4)}, ${task.longitude.toFixed(4)}</p>
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
            handleTaskClick(task); // Open balloon
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', width: '100%', bgcolor: '#121212', color: '#1e1e1e', position: 'relative', overflow: 'hidden' }}>
            {/* Search button */}
            <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: 20,
                    right: 20,
                    zIndex: 1000,
                    m: 1,
                    borderRadius: 20,
                    px: 2,
                    py: 0.5,
                    minWidth: 'auto',
                    fontSize: '0.875rem',
                    bgcolor: '#4caf50',
                    '&:hover': {
                        bgcolor: '#43a047',
                    },
                }}
                onClick={() => setSearchDialogOpen(true)} // Open search dialog
            >
                Поиск
            </Button>

            {/* Search dialog */}
            <Dialog
                open={searchDialogOpen}
                onClose={() => setSearchDialogOpen(false)}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e', // Темный фон
                        color: '#fff',      // Белый текст
                        p: 3,               // Отступы
                        borderRadius: 2,    // Закругленные углы
                    },
                }}
            >
                <DialogTitle sx={{ color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Поиск задач</Typography>
                    <IconButton onClick={() => setSearchDialogOpen(false)}>
                        <CloseIcon sx={{ color: '#fff' }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box>
                        {tasks.map((task) => (
                            <Box
                                key={task.idTask}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 2,
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.02)' },
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    {task.title}
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    {task.description.length > 100
                                        ? `${task.description.substring(0, 100)}...`
                                        : task.description}
                                </Typography>
                                <Chip
                                    label={difficultyLabels[task.difficulty]}
                                    color={difficultyColors[task.difficulty]}
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                                <Typography variant="body2">
                                    <IconButton
                                        onClick={() => handleShowOnMap(task)}
                                        sx={{ color: '#fff' }}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                    Показать на карте
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Yandex Map */}
            <YMaps query={{ apikey: 'd684eaf-87b3-461c-b599-acc5ccafba31' }}>
                <Map
                    defaultState={{ center: [55.7558, 37.6173], zoom: 11 }}
                    instanceRef={setMapRef}
                    width="100%"
                    height="100%"
                    modules={['control.ZoomControl', 'control.FullscreenControl']}
                    options={{
                        suppressMapOpenBlock: true,
                        yandexMapDisablePoiInteractivity: true,
                    }}
                >
                    {/* Task markers */}
                    {tasks.map((task) => (
                        <Placemark
                            key={task.idTask}
                            geometry={[task.latitude, task.longitude]}
                            options={{
                                iconLayout: 'default#image',
                                iconImageHref: taskMarkerIcon,
                                iconImageSize: [36, 36],
                                iconImageOffset: [-18, -36],
                            }}
                            properties={{
                                hintContent: task.title,
                                balloonContent: createBalloonContent(task),
                            }}
                            onClick={() => handleTaskClick(task)}
                        />
                    ))}
                </Map>
            </YMaps>
        </Box>
    );
};

export default MapPage;