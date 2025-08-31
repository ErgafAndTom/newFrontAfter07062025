import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const DatabaseSchemaVisualizer = () => {
    const mountRef = useRef(null);
    const [schema, setSchema] = useState([]);

    // Инициализация сцены
    const initScene = () => {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 20);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        // Добавляем управление камерой
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        return { scene, camera, renderer, controls };
    };

    // Функция для создания 3D-узлов (таблиц) и связей
    const createSchemaVisualization = (scene, schema) => {
        const nodeMaterial = new THREE.MeshPhongMaterial({ color: 0x156289 });
        const nodeGeometry = new THREE.SphereGeometry(0.8, 32, 32);

        const nodes = {};
        const totalNodes = schema.length;
        const radius = 10; // радиус расположения узлов по кругу

        // Расположение узлов по окружности
        schema.forEach((item, index) => {
            const angle = (index / totalNodes) * Math.PI * 2;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);

            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
            nodeMesh.position.set(x, y, 0);

            // Добавляем метку (простой текст через спрайты)
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            context.fillStyle = '#000';
            context.font = '24px inter';
            context.fillText(item.table, 10, 40);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(5, 1.25, 1);
            sprite.position.set(0, 1.2, 0);
            nodeMesh.add(sprite);

            scene.add(nodeMesh);
            nodes[item.table] = nodeMesh;
        });

        // Отрисовка связей между узлами
        schema.forEach(item => {
            const sourceNode = nodes[item.table];
            item.associations.forEach(assoc => {
                const targetNode = nodes[assoc.target];
                // Если узел существует (возможно, связь на таблицу, которая не описана в схеме)
                if (targetNode) {
                    const points = [];
                    points.push(sourceNode.position);
                    points.push(targetNode.position);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
                    scene.add(line);
                }
            });
        });
    };

    useEffect(() => {
        const { scene, camera, renderer, controls } = initScene();

        // Запрос схемы базы данных с сервера
        axios.post('/statistics/getSchema')
            .then(response => {
                // console.log(response.data);
                setSchema(response.data);
                createSchemaVisualization(scene, response.data);
            })
            .catch(error => {
                console.error('Ошибка получения схемы:', error);
            });

        // Анимационный цикл
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Очистка при размонтировании компонента
        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{ width: '900px', height: '600px', border: '1px solid #ccc' }}
        />
    );
};

export default DatabaseSchemaVisualizer;
