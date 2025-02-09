package com.example.myapplication;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.yandex.mapkit.Animation;
import com.yandex.mapkit.MapKitFactory;
import com.yandex.mapkit.geometry.Point;
import com.yandex.mapkit.map.CameraPosition;
import com.yandex.mapkit.map.MapObjectCollection;
import com.yandex.mapkit.map.PlacemarkMapObject;
import com.yandex.mapkit.mapview.MapView;

public class TasksFragment extends Fragment {

    private static final String YANDEX_MAPKIT_API_KEY = "d07e1af7-5a3d-4fdb-99d5-2cb28e0dbf1e";
    private MapView mapView;
    private MapObjectCollection mapObjects;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Инициализация MapKit
        MapKitFactory.setApiKey(YANDEX_MAPKIT_API_KEY);
        MapKitFactory.initialize(requireContext());
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_tasks, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Получаем ссылку на MapView
        mapView = view.findViewById(R.id.yandex_mapview);
        mapView.getMap().move(
                new CameraPosition(new Point(55.7558, 37.6173), 12.0f, 0.0f, 0.0f), // Координаты Москвы
                new Animation(Animation.Type.SMOOTH, 0),
                null
        );

        // Добавляем маркер на карту
        mapObjects = mapView.getMap().getMapObjects().addCollection();
        PlacemarkMapObject placemark = mapObjects.addPlacemark(new Point(55.7558, 37.6173));
        placemark.setIcon(createIconWithText("Task Location"));
    }

    @Override
    public void onStart() {
        super.onStart();
        if (mapView != null) {
            mapView.onStart(); // Запуск MapView
        }
        MapKitFactory.getInstance().onStart(); // Запуск MapKit
    }

    @Override
    public void onStop() {
        super.onStop();
        if (mapView != null) {
            mapView.onStop(); // Остановка MapView
        }
        MapKitFactory.getInstance().onStop(); // Остановка MapKit
    }
}