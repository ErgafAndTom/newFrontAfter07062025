import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ThreeDChart = ({ state }) => {
    const navigate = useNavigate();
    const mountRef = useRef(null);
    const [chartData, setChartData] = useState(null);

    // Функция инициализации 3D-сцены
    const initScene = () => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Создаем сцену
        const scene = new THREE.Scene();

        // Создаем камеру
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;

        // Создаем рендерер
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        // Добавляем базовый источник света
        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        return { scene, camera, renderer };
    };

    // Функция для отрисовки объектов на основе данных
    const createChartObjects = (scene, data) => {
        // Пример: создаем несколько кубов, высота которых зависит от значений из data
        // Предположим, что data имеет вид [{ value: число, ... }, ...]
        if (!data || !Array.isArray(data)) return;

        data.forEach((item, index) => {
            const geometry = new THREE.BoxGeometry(0.5, item.value, 0.5);
            const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = index - data.length / 2;
            cube.position.y = item.value / 2; // чтобы кубы "стояли" на земле
            scene.add(cube);
        });
    };

    useEffect(() => {
        // Инициализация сцены
        const { scene, camera, renderer } = initScene();

        // Запрос данных с сервера
        const fetchData = async () => {
            let data = {
                start_date: state[0].startDate,
                end_date: state[0].endDate,
            };
            // console.log(data);
            try {
                const response = await axios.post(`/statistics/getChartData`, data);
                // console.log(response.data);
                setChartData(response.data);
                // После получения данных создаем объекты на сцене
                createChartObjects(scene, response.data);
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    // Перенаправление на страницу логина или другая логика
                    navigate('/login');
                }
                console.error(error.message);
            }
        };

        fetchData();

        // Анимационный цикл
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Очистка ресурсов при размонтировании компонента
        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [state]);

    return (
        <div
            ref={mountRef}
            style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}
        />
    );
};

export default ThreeDChart;
