import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const TimeSeriesChart1 = ({ data }) => {
    const mountRef = useRef(null);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Цвета для статусов, аналогично вашему примеру
    const statusColors = {
        "0": 0xffffff,
        "1": 0x8b4513,
        "2": 0x3c60a6,
        "3": 0xf075aa,
        "4": 0x008249,
    };

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Размеры контейнера
        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Сцена, камера, рендерер
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(0, 0, 40);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // Управление камерой
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Параметры графика
        const padding = 5;
        const chartWidth = 30; // внутренний размер по оси X
        const chartHeight = 20; // внутренний размер по оси Y

        // Преобразуем данные времени и значения
        const times = data.map((point) => new Date(point.time).getTime());
        const values = data.map((point) => point.value);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Функции нормализации координат
        const normalizeX = (time) =>
            ((time - minTime) / (maxTime - minTime)) * chartWidth - chartWidth / 2;
        const normalizeY = (value) =>
            ((value - minValue) / (maxValue - minValue)) * chartHeight - chartHeight / 2;

        // Группа для графических объектов
        const chartGroup = new THREE.Group();
        scene.add(chartGroup);

        // Создаем осевой прямоугольник (рамку)
        const frameGeometry = new THREE.BufferGeometry();
        const frameVertices = new Float32Array([
            -chartWidth / 2, -chartHeight / 2, 0,
            chartWidth / 2, -chartHeight / 2, 0,
            chartWidth / 2, chartHeight / 2, 0,
            -chartWidth / 2, chartHeight / 2, 0,
            -chartWidth / 2, -chartHeight / 2, 0,
        ]);
        frameGeometry.setAttribute("position", new THREE.BufferAttribute(frameVertices, 3));
        const frameMaterial = new THREE.LineBasicMaterial({ color: 0xdddddd });
        const frameLine = new THREE.Line(frameGeometry, frameMaterial);
        chartGroup.add(frameLine);

        // Создаем линию графика
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const linePoints = [];
        data.forEach((point, i) => {
            const x = normalizeX(times[i]);
            const y = normalizeY(point.value);
            linePoints.push(new THREE.Vector3(x, y, 0));
        });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineChart = new THREE.Line(lineGeometry, lineMaterial);
        chartGroup.add(lineChart);

        // Группа для точек графика
        const pointsGroup = new THREE.Group();
        chartGroup.add(pointsGroup);

        // Создаем точки графика (сферы)
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        data.forEach((point, i) => {
            const x = normalizeX(times[i]);
            const y = normalizeY(point.value);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: statusColors[point.status] || 0xff0000,
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(x, y, 0);
            // Сохраним информацию в userData для обработки hover
            sphere.userData = {
                value: point.value,
                time: point.time,
            };
            pointsGroup.add(sphere);
        });

        // Вертикальная линия для hover
        const hoverLineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -chartHeight / 2, 0),
            new THREE.Vector3(0, chartHeight / 2, 0),
        ]);
        const hoverLineMaterial = new THREE.LineDashedMaterial({
            color: 0x888888,
            dashSize: 0.5,
            gapSize: 0.2,
        });
        const hoverLine = new THREE.Line(hoverLineGeometry, hoverLineMaterial);
        hoverLine.computeLineDistances();
        hoverLine.visible = false;
        chartGroup.add(hoverLine);

        // Raycaster для определения пересечения с точками
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Функция обновления hover
        const onMouseMove = (event) => {
            // Координаты мыши в пределах рендера
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            // Поиск пересечений с точками
            const intersects = raycaster.intersectObjects(pointsGroup.children);
            if (intersects.length > 0) {
                const intersected = intersects[0].object;
                setHoveredPoint(intersected.userData);
                // Позиция точки в локальных координатах графа
                const hoverX = intersected.position.x;
                // Обновляем положение вертикальной линии
                hoverLine.position.x = hoverX;
                hoverLine.visible = true;
            } else {
                setHoveredPoint(null);
                hoverLine.visible = false;
            }
        };

        renderer.domElement.addEventListener("mousemove", onMouseMove);

        // Анимация
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Очистка ресурсов при размонтировании компонента
        return () => {
            renderer.domElement.removeEventListener("mousemove", onMouseMove);
            container.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, [data]);

    return (
        <div
            ref={mountRef}
            style={{ width: "700px", height: "400px", border: "1px solid #ccc" }}
        >
            {hoveredPoint && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "rgba(255,255,255,0.8)",
                        padding: "5px",
                        border: "1px solid #ccc",
                    }}
                >
                    <div>
                        <strong>Значение:</strong> {hoveredPoint.value.toFixed(2)}
                    </div>
                    <div>
                        <strong>Время:</strong> {new Date(hoveredPoint.time).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeSeriesChart1;
