import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * useMugScene — realistic 11oz sublimation mug (cylindrical, smooth C-handle, thin rim).
 *
 * @param {React.RefObject<HTMLDivElement>} containerRef
 * @param {Object}  opts
 * @param {string}  [opts.textureUrl]
 * @param {Object}  [opts.textureSettings] — { offsetX, offsetY, scale, rotation }
 * @param {boolean} [opts.interactive=true]
 * @param {string}  [opts.handleColor='#f5f5f0'] — handle & inner color (CSS hex)
 * @returns {{ updateTexture, updateSettings, updateHandleColor, dispose }}
 */
export default function useMugScene(containerRef, opts = {}) {
    const sceneRef       = useRef(null);
    const rendererRef    = useRef(null);
    const cameraRef      = useRef(null);
    const controlsRef    = useRef(null);
    const mugMatRef      = useRef(null);   // body ceramic (no texture)
    const printMatRef    = useRef(null);   // print cylinder material (receives texture)
    const handleMatRef   = useRef(null);   // handle material
    const innerMatRef    = useRef(null);    // inner surface material
    const accentMatsRef  = useRef([]);      // rim + bottom colored materials
    const frameRef       = useRef(0);
    const textureRef     = useRef(null);
    const disposablesRef = useRef([]);
    const imageRef       = useRef(null);
    const texCanvasRef   = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const w = container.clientWidth  || 400;
        const h = container.clientHeight || 400;
        const disposables = [];

        const initColor = opts.handleColor || '#f5f5f0';

        // ── Scene ──
        const scene = new THREE.Scene();
        scene.background = null;
        sceneRef.current = scene;

        // ── Camera ──
        const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100);
        camera.position.set(-4.2, 2.2, -4.2);
        camera.lookAt(0, 0.4, 0);
        cameraRef.current = camera;

        // ── Renderer ──
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ── Lights ──
        scene.add(new THREE.AmbientLight(0xffffff, 0.85));

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
        keyLight.position.set(5, 8, 4);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
        fillLight.position.set(-4, 3, -2);
        scene.add(fillLight);

        const rimLightObj = new THREE.DirectionalLight(0xffffff, 0.25);
        rimLightObj.position.set(0, 1, -5);
        scene.add(rimLightObj);

        // ── Mug dimensions (11oz / 330ml sublimation mug) ──
        const H = 1.55;
        const R = 0.67;
        const Rbot = R - 0.005;
        const Rtop = R;
        const wall = 0.05;
        const rimH = 0.025;
        const rimOut = 0.0;       // no outward lip — rim stays flush with cylinder
        const botThick = 0.07;

        // ── Profile (LatheGeometry cross-section) — outer wall + rim only ──
        // No inner wall — the colored inner cylinder handles the interior
        const pts = [
            new THREE.Vector2(0.001, 0),
            new THREE.Vector2(Rbot - 0.02, 0),
            new THREE.Vector2(Rbot, 0.003),
            new THREE.Vector2(Rbot + 0.005, 0.03),
            new THREE.Vector2(Rbot + 0.008, H * 0.1),
            new THREE.Vector2(Rtop - 0.003, H * 0.9),
            new THREE.Vector2(Rtop, H),
            new THREE.Vector2(Rtop, H + rimH * 0.5),
            new THREE.Vector2(Rtop - wall * 0.15, H + rimH),
            new THREE.Vector2(Rtop - wall * 0.5, H + rimH * 0.6),
        ];

        const segments = 64;
        const bodyGeo = new THREE.LatheGeometry(pts, segments);

        const totalH = H + rimH;

        // Outer ceramic material (plain white — no texture)
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xf8f8f5,
            roughness: 0.22,
            metalness: 0.01,
            side: THREE.FrontSide,
        });
        mugMatRef.current = bodyMat;
        disposables.push(bodyGeo, bodyMat);
        scene.add(new THREE.Mesh(bodyGeo, bodyMat));

        // ── Print cylinder — separate mesh covering ONLY the cylindrical wall ──
        // Sits 0.001 outside the mug to avoid z-fighting, no caps (open-ended)
        const printBot = H * 0.02;                     // just above the base curve
        const printTop = H + rimH * 0.4;               // extends slightly into rim
        const printHeight = printTop - printBot;
        // Must exceed the max body radius at ALL heights (profile bulges to Rbot+0.008=0.673)
        const printBotR = Rbot + 0.008 + 0.003;      // 0.676 — always outside body profile
        const printTopR = Rtop + 0.003;                // 0.673 — outside top of body
        const printGeo = new THREE.CylinderGeometry(
            printTopR, printBotR, printHeight, segments, 1, true
        );
        const printMat = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 1,
            roughness: 0.22,
            metalness: 0.01,
            side: THREE.FrontSide,
        });
        printMatRef.current = printMat;
        const printMesh = new THREE.Mesh(printGeo, printMat);
        printMesh.position.y = printBot + printHeight / 2;
        scene.add(printMesh);
        disposables.push(printGeo, printMat);

        // ── Inner surface (colored) ──
        // Inner cylinder — extends from near bottom up to rim level
        const innerTopR = Rtop - wall;     // match inner wall of body
        const innerBotR = Rbot - wall;
        const innerHeight = H + rimH - 0.01;     // start almost from y=0
        const innerGeo = new THREE.CylinderGeometry(
            innerTopR, innerBotR,
            innerHeight, segments, 1, true
        );
        const innerMat = new THREE.MeshStandardMaterial({
            color: initColor, roughness: 0.35, metalness: 0.01, side: THREE.DoubleSide,
        });
        innerMatRef.current = innerMat;
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.y = 0.01 + innerHeight / 2;
        scene.add(inner);
        disposables.push(innerGeo, innerMat);

        // Inner bottom disk — covers entire interior floor
        const innerBotGeo = new THREE.CircleGeometry(innerBotR, segments);
        const innerBot = new THREE.Mesh(innerBotGeo, innerMat);
        innerBot.rotation.x = -Math.PI / 2;
        innerBot.position.y = botThick - 0.005;
        scene.add(innerBot);
        disposables.push(innerBotGeo);

        // ── Smooth C-handle (CubicBezierCurve3 — zero kinks) ──
        const hTop = H * 0.80;
        const hBot = H * 0.18;
        const hOut = 0.34;          // 20% narrower (was 0.42)
        const hMid = (hTop + hBot) / 2;

        // Two cubic bezier halves joined at midpoint
        // Handle starts outside body surface — white ceramic gap visible at junction
        const hAttach = Rtop + 0.04;
        const topHalf = new THREE.CubicBezierCurve3(
            new THREE.Vector3(hAttach,              hTop,   0),
            new THREE.Vector3(Rtop + hOut * 0.55,   hTop,   0),
            new THREE.Vector3(Rtop + hOut + 0.02, hMid + (hTop - hMid) * 0.5, 0),
            new THREE.Vector3(Rtop + hOut + 0.02, hMid,  0),
        );
        const botHalf = new THREE.CubicBezierCurve3(
            new THREE.Vector3(Rtop + hOut + 0.02, hMid,  0),
            new THREE.Vector3(Rtop + hOut + 0.02, hMid - (hMid - hBot) * 0.5, 0),
            new THREE.Vector3(Rtop + hOut * 0.55,   hBot,   0),
            new THREE.Vector3(hAttach,              hBot,   0),
        );

        // Sample both halves into one smooth path
        const handlePts = [];
        const halfN = 32;
        for (let i = 0; i <= halfN; i++) {
            handlePts.push(topHalf.getPoint(i / halfN));
        }
        for (let i = 1; i <= halfN; i++) {
            handlePts.push(botHalf.getPoint(i / halfN));
        }
        const handleCurve = new THREE.CatmullRomCurve3(handlePts, false, 'catmullrom', 0);
        const handleGeo = new THREE.TubeGeometry(handleCurve, 64, 0.07, 16, false); // thicker (was 0.055)
        const handleMat = new THREE.MeshStandardMaterial({
            color: initColor, roughness: 0.22, metalness: 0.01,
        });
        handleMatRef.current = handleMat;
        disposables.push(handleGeo, handleMat);
        scene.add(new THREE.Mesh(handleGeo, handleMat));

        // ── White ceramic cylinders at handle junction points ──
        const juncRadius = 0.07;      // same as handle tube radius
        const juncLength = 0.06;
        const juncGeo = new THREE.CylinderGeometry(juncRadius, juncRadius, juncLength, 32);
        const juncMat = new THREE.MeshStandardMaterial({
            color: 0xf8f8f5, roughness: 0.22, metalness: 0.01,
        });
        // Top junction — cylinder lying horizontal, pointing outward (along X)
        const juncTop = new THREE.Mesh(juncGeo, juncMat);
        juncTop.position.set(Rtop + 0.02, hTop, 0);
        juncTop.rotation.set(0, 0, Math.PI / 2);
        scene.add(juncTop);
        // Bottom junction
        const juncBot = new THREE.Mesh(juncGeo.clone(), juncMat);
        juncBot.position.set(Rtop + 0.02, hBot, 0);
        juncBot.rotation.set(0, 0, Math.PI / 2);
        scene.add(juncBot);
        disposables.push(juncGeo, juncMat);

        // ── Colored rim — convex torus INSIDE cylinder wall ──
        // Outer edge must NOT exceed Rtop
        const rimTube = wall * 0.5;            // inner edge flush with inner cylinder
        const rimR = Rtop - rimTube;           // outer edge = Rtop, inner edge = Rtop - wall
        const rimGeo = new THREE.TorusGeometry(rimR, rimTube, 16, segments);
        const rimMat = new THREE.MeshStandardMaterial({
            color: initColor, roughness: 0.25, metalness: 0.01,
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = H + rimH * 0.35;
        scene.add(rim);
        disposables.push(rimGeo, rimMat);

        // External bottom is white (from LatheGeometry profile).
        // Only the interior bottom (innerBotGeo above) is colored.

        accentMatsRef.current = [rimMat];

        // ── Shadow disk ──
        const shadowGeo = new THREE.CircleGeometry(1.0, 64);
        const shadowMat = new THREE.MeshStandardMaterial({
            color: 0x000000, transparent: true, opacity: 0.05,
        });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -0.003;
        scene.add(shadow);
        disposables.push(shadowGeo, shadowMat);

        disposablesRef.current = disposables;

        // ── Controls ──
        if (opts.interactive !== false) {
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;
            controls.enablePan = false;
            controls.minDistance = 2.5;
            controls.maxDistance = 8;
            controls.maxPolarAngle = Math.PI * 0.85;
            controls.target.set(0, H * 0.45, 0);
            controlsRef.current = controls;
        }

        // ── Animation loop ──
        const animate = () => {
            frameRef.current = requestAnimationFrame(animate);
            if (controlsRef.current) controlsRef.current.update();
            renderer.render(scene, camera);
        };
        animate();

        // ── Resize (debounced via rAF to avoid ResizeObserver loop error) ──
        let resizeRaf = 0;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(() => {
                const nw = container.clientWidth;
                const nh = container.clientHeight;
                if (nw && nh) {
                    camera.aspect = nw / nh;
                    camera.updateProjectionMatrix();
                    renderer.setSize(nw, nh);
                }
            });
        });
        ro.observe(container);

        if (opts.textureUrl) {
            loadTexture(opts.textureUrl, opts.textureSettings);
        }

        return () => {
            cancelAnimationFrame(frameRef.current);
            ro.disconnect();
            if (controlsRef.current) controlsRef.current.dispose();
            renderer.dispose();
            disposablesRef.current.forEach(d => d.dispose());
            if (textureRef.current) textureRef.current.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    // ── Canvas-based texture: proportional, no stretch/tile ──
    const drawTextureCanvas = useCallback((settings) => {
        const img = imageRef.current;
        if (!img) return;

        const s = settings || {};
        const scale    = s.scale    || 1;
        const offX     = s.offsetX  || 0;
        const offY     = s.offsetY  || 0;
        const rotation = s.rotation || 0;

        const CW = 2048;
        const CH = 1024;

        let canvas = texCanvasRef.current;
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width  = CW;
            canvas.height = CH;
            texCanvasRef.current = canvas;
        }

        const ctx = canvas.getContext('2d');
        // White ceramic background
        ctx.fillStyle = '#f8f8f5';
        ctx.fillRect(0, 0, CW, CH);

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgAspect = imgW / imgH;

        // Gap from handle on each side — keeps white ceramic visible around handle
        const gapFraction = 0.075;
        const gapPx = CW * gapFraction;
        const printableW = CW - 2 * gapPx;

        // No top/bottom margins — image fills full canvas height
        // Bottom gap handled by UV remapping (base compressed into 2% of canvas)
        const printableH = CH;

        // Narrow image by 20% to correct horizontal stretch on cylinder
        const stretchCorrection = 0.80;

        // Always fill full height — wide images wrap around the mug naturally
        let drawW, drawH;
        drawH = printableH;
        drawW = printableH * imgAspect * stretchCorrection;

        // Apply user scale
        drawW *= scale;
        drawH *= scale;

        // Center within printable area (top-aligned, bottom gap for base)
        const drawX = (CW - drawW) / 2 + offX * CW * 0.5;
        const drawY = (printableH - drawH) / 2 - offY * CH * 0.5;

        ctx.save();
        if (rotation) {
            ctx.translate(CW / 2, CH / 2);
            ctx.rotate(rotation);
            ctx.translate(-CW / 2, -CH / 2);
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();


        // Create or update CanvasTexture
        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        } else {
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            // CylinderGeometry starts at +Z, handle is at +X (90° = 25% around)
            // Shift by 75% so the white gap (canvas edges) aligns with the handle
            tex.offset.x = 0.75;
            textureRef.current = tex;

            if (printMatRef.current) {
                printMatRef.current.map = tex;
                printMatRef.current.needsUpdate = true;
            }
        }
    }, []);

    const loadTexture = useCallback((url, settings) => {
        if (!url) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageRef.current = img;
            drawTextureCanvas(settings);
        };
        img.src = url;
    }, [drawTextureCanvas]);

    const updateTexture = useCallback((url) => {
        loadTexture(url, null);
    }, [loadTexture]);

    const updateSettings = useCallback((settings) => {
        if (!imageRef.current || !settings) return;
        drawTextureCanvas(settings);
    }, [drawTextureCanvas]);

    // ── Change handle + inner + rim + bottom color at runtime ──
    const updateHandleColor = useCallback((hexColor) => {
        const c = new THREE.Color(hexColor);
        if (handleMatRef.current) {
            handleMatRef.current.color.copy(c);
            handleMatRef.current.needsUpdate = true;
        }
        if (innerMatRef.current) {
            innerMatRef.current.color.copy(c);
            innerMatRef.current.needsUpdate = true;
        }
        // Rim + bottom
        accentMatsRef.current.forEach(mat => {
            mat.color.copy(c);
            mat.needsUpdate = true;
        });
    }, []);

    const dispose = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        if (rendererRef.current) rendererRef.current.dispose();
        if (controlsRef.current) controlsRef.current.dispose();
        if (textureRef.current)  textureRef.current.dispose();
        imageRef.current    = null;
        texCanvasRef.current = null;
    }, []);

    return { updateTexture, updateSettings, updateHandleColor, dispose };
}
