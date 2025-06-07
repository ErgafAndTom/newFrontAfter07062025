import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Пастельный градиентный фон (имитирующий комнату)
function createGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    // Градиент от верха к низу: нежно-голубой сверху, чуть теплее снизу
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#dfe9f3');
    gradient.addColorStop(1, '#f5f7fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
}

// Эластичная easing-функция для мягкого переворота (движения)
function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
        ? 0
        : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

const NoteVisual = ({
                        x = 1,           // Ширина страницы (по горизонтали)
                        y = 1.5,         // Высота страницы (по вертикали)
                        pages = 50,      // Количество страниц
                        textureUrl       // Опциональная текстура для "бумаги"
                    }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        let renderer, scene, camera, controls, animationFrameId;
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // === Создание рендерера ===
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerWidth, containerHeight);
        container.appendChild(renderer.domElement);

        // === Сцена с пастельным градиентным фоном ===
        scene = new THREE.Scene();
        scene.background = createGradientTexture();

        // === Параметры "бумаги" ===
        const pageThickness = 0.002; // толщина одной страницы
        const gap = 0.001;           // зазор между страницами в стопке
        const separationBetweenFlipped = 0.005; // зазор между перевёрнутыми и не перевёрнутыми

        // === Толщина блокнота ===
        const totalThickness = pages * pageThickness + (pages - 1) * gap;

        // === Камера ===
        const maxDim = Math.max(x, y, totalThickness);
        const cameraDistance = maxDim * 4;
        camera = new THREE.PerspectiveCamera(50, containerWidth / containerHeight, 0.1, 1000);
        camera.position.set(cameraDistance, cameraDistance, cameraDistance);
        camera.lookAt(0, 0, 0);

        // === Свет ===
        // Прикрепляем мощные источники к камере (двигаются вместе с ней)
        const mainLight1 = new THREE.DirectionalLight(0xfff8e1, 4.0); // тёплый, желтоватый
        mainLight1.position.set(-5, 5, 5);
        camera.add(mainLight1);

        const mainLight2 = new THREE.DirectionalLight(0xadd8e6, 4.0); // голубой
        mainLight2.position.set(5, 5, 5);
        camera.add(mainLight2);

        scene.add(camera);

        // Дополнительные источники снизу и сверху
        const bottomLight = new THREE.DirectionalLight(0xffc0cb, 2.0);
        bottomLight.position.set(0, -5, 5);
        scene.add(bottomLight);

        const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
        topLight.position.set(0, 5, 5);
        scene.add(topLight);

        // Ambient
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        // === Вычислим "эталонные" толщины для 120 и 240 листов, чтобы понять диаметр пружины ===
        const thickness120 = 120 * pageThickness + (120 - 1) * gap;
        const thickness240 = 240 * pageThickness + (240 - 1) * gap;

        // Диаметр пружины: если pages <= 120 => берём 120-страничную, если <=240 => 240-страничную, иначе тоже 240
        let ringDiameter = thickness240 * 1.2;
        if (pages <= 120) {
            ringDiameter = thickness120 * 1.2;
        } else if (pages <= 240) {
            ringDiameter = thickness240 * 1.2;
        }
        const ringRadius = ringDiameter * 0.5;

        // === Пружина: кольца с расстоянием 1 см (0.01) и толщиной (шириной) 1.3 см (0.013) ===
        const ringSpacing = 0.01; // 1 см
        const ringWidth = 0.013;  // 1.3 см
        // Количество колец (упрощённо), например, min(20, pages)
        const ringCount = Math.min(20, pages);

        // === Группа для всей пружины (гребёнки) ===
        const combGroup = new THREE.Group();
        // Смещаем её левее так, чтобы центр колец был примерно у x=0
        // Если страница будет "обматываться" вокруг пружины, pivot у нас будет на x = -ringRadius
        combGroup.position.set(-ringRadius, 0, 0);
        scene.add(combGroup);

        // Расстояние между кольцами по вертикали
        const ringFullHeight = (ringCount > 1) ? ringSpacing * (ringCount - 1) : 0;
        // Начальная точка (нижний край) –y/2, конечная +y/2.
        // Но пользователь просил 1см между кольцами, значит ringSpacing = 0.01.
        // Распределим кольца примерно по высоте y или чуть больше.
        const ringStartY = -Math.min(y / 2, (ringCount - 1) * ringSpacing / 2);
        // Полуцилиндр: CylinderGeometry с углом Math.PI
        const ringSegments = 16;
        const ringGeometry = new THREE.CylinderGeometry(
            ringRadius * 0.5,   // радиус (в демо можно уменьшить, иначе кольца будут слишком толстые)
            ringRadius * 0.5,
            ringWidth,          // «длина» цилиндра
            ringSegments,
            1,
            true,
            0,
            Math.PI
        );
        const ringMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        for (let i = 0; i < ringCount; i++) {
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            // Повернём кольца, чтобы открытая часть смотрела вправо (к страницам)
            ringMesh.rotation.y = -Math.PI / 2;
            // Позиция по Y
            const offsetY = ringStartY + i * ringSpacing;
            ringMesh.position.set(0, offsetY, 0);
            combGroup.add(ringMesh);
        }

        // === Группа для страниц ===
        const pagesGroup = new THREE.Group();
        scene.add(pagesGroup);

        // Загрузка текстуры «офисной бумаги»
        let paperTexture = null;
        if (textureUrl) {
            const loader = new THREE.TextureLoader();
            paperTexture = loader.load(textureUrl);
            paperTexture.wrapS = paperTexture.wrapT = THREE.RepeatWrapping;
            paperTexture.repeat.set(1, 1);
        }

        // Массив pivot-групп для страниц (вместо простых mesh)
        // Каждая страница будет лежать в своём pivot, чтобы вращаться вокруг центра пружины
        const closedPagePivots = [];
        let flippedOffset = 0; // смещение для уже перевёрнутых страниц

        for (let i = 0; i < pages; i++) {
            // Создаём pivot-группу
            const pivotGroup = new THREE.Group();
            pagesGroup.add(pivotGroup);

            // pivotGroup располагаем в стопке по оси Z
            // Верхняя страница (i=0) ближе к наблюдателю (z=0),
            // следующая уходит "назад" по z
            const zPos = -(pageThickness + gap) * i;
            pivotGroup.position.set(-ringRadius, 0, zPos);

            // Внутри pivot'а создаём саму страницу
            const geometry = new THREE.BoxGeometry(x, y, pageThickness);
            // Но страница должна находиться на x = +ringRadius (чтобы при вращении pivot'а
            // она описывала полукруг вокруг пружины)
            // При этом левый край страницы должен совпасть с x=0 pivot'а, значит смещаем:
            // geometry центрирован, смещаем на x= x/2, и сам mesh ставим на x= ringRadius - x/2
            geometry.translate(x / 2, 0, 0);

            const material = new THREE.MeshPhysicalMaterial({
                map: paperTexture || null,
                color: 0xffffff,
                roughness: 0.9,
                metalness: 0.0,
                bumpMap: paperTexture || null,
                bumpScale: 0.005,
                reflectivity: 0.2,
            });
            const pageMesh = new THREE.Mesh(geometry, material);

            // Размещаем страницу так, чтобы её левый край был возле центра pivot'а (x=0)
            // pivot сам стоит на x=-ringRadius, значит страница mesh стоит на x= ringRadius - x/2
            pageMesh.position.x = ringRadius - x / 2;

            pivotGroup.add(pageMesh);

            // Добавляем pivotGroup в массив закрытых (не перевёрнутых)
            closedPagePivots.push(pivotGroup);

            // Разделительная линия (если не последняя страница)
            if (i < pages - 1) {
                const sepGeo = new THREE.BoxGeometry(0.005, y, gap);
                const sepMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
                const sepMesh = new THREE.Mesh(sepGeo, sepMat);
                // Разместим линию чуть правее pivot'а, на x= ringRadius - x/2
                // чтобы она была «по торцу» страниц
                sepMesh.position.set(
                    ringRadius - x / 2,
                    0,
                    zPos - gap / 2
                );
                pagesGroup.add(sepMesh);
            }
        }

        // === Логика переворачивания ===
        let flipping = false;
        let flipStartTime = 0;
        const flipDuration = 333; // быстрее обычного
        let flippingPivot = null;
        let startRotation = 0; // начальный угол pivot'а

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Клик по верхней pivotGroup (первая в closedPagePivots)
        const onClick = (event) => {
            if (closedPagePivots.length === 0 || flipping) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);

            // Проверяем пересечение со страницей внутри pivot'а
            // pivotGroup.children[0] — это Mesh страницы
            const topPivot = closedPagePivots[0];
            const pageMesh = topPivot.children[0];
            const intersects = raycaster.intersectObject(pageMesh);
            if (intersects.length > 0) {
                flipping = true;
                flippingPivot = closedPagePivots.shift(); // убираем верхний pivot из массива
                flipStartTime = performance.now();
                startRotation = flippingPivot.rotation.z; // вращение вокруг z
            }
        };

        renderer.domElement.addEventListener('mousedown', (event) => {
            if (event.button === 0) {
                onClick(event);
            }
        });

        // === OrbitControls ===
        controls = new OrbitControls(camera, renderer.domElement);
        controls.mouseButtons = {
            LEFT: null,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE,
        };
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;

        // === Анимация ===
        const animate = () => {
            const currentTime = performance.now();
            if (flipping && flippingPivot) {
                const elapsed = currentTime - flipStartTime;
                const t = Math.min(elapsed / flipDuration, 1);
                const easedT = easeOutElastic(t);

                // Вращаем pivot вокруг z от 0 до +Math.PI (полукруг)
                // чтобы страница шла по дуге вокруг пружины
                flippingPivot.rotation.z = startRotation + easedT * Math.PI;

                if (t >= 1) {
                    flipping = false;
                    flippingPivot.rotation.z = startRotation + Math.PI;

                    // Смещаем pivot глубже по оси Z, учитывая separationBetweenFlipped
                    flippingPivot.position.z = -(
                        flippedOffset + pageThickness + gap + separationBetweenFlipped
                    );
                    // Увеличиваем смещение, чтобы следующие страницы располагались ещё дальше
                    flippedOffset += (pageThickness + gap + separationBetweenFlipped);

                    flippingPivot = null;
                }
            }

            controls.update();
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // === Ресайз ===
        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', onClick);
            cancelAnimationFrame(animationFrameId);
            controls.dispose();
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, [x, y, pages, textureUrl]);

    // Контейнер 50vw x 50vw в левом верхнем углу
    const containerStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50vw',
        height: '50vw'
    };

    return <div style={containerStyle} ref={containerRef}></div>;
};

export default NoteVisual;
