import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const NUM_SHELVES = 6;
const BOOKCASE_HEIGHT = 5;
const BOOKCASE_WIDTH = 7;
const SHELF_DEPTH = 2;

const Scene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(0, 1, 5);
        scene.add(pointLight);

        const gradientMaterial = createGradientMaterial(); // Function to create gradient material
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        const usableHeight = BOOKCASE_HEIGHT - 0.1;
        const shelfGeometry = new THREE.BoxGeometry(BOOKCASE_WIDTH, 0.1, SHELF_DEPTH);
        // Create and position side panels with edge lines
        const sidePanelHeight = BOOKCASE_HEIGHT;
        const sidePanelGeometry = new THREE.BoxGeometry(0.1, sidePanelHeight, SHELF_DEPTH);

        const sidePanelYPosition = sidePanelHeight / 2 - 0.05; // Half the height - thickness of the bottom panel
        // Adjust the backPanelGeometry to use the updated BOOKCASE_WIDTH and BOOKCASE_HEIGHT
        const backPanelGeometry = new THREE.BoxGeometry(BOOKCASE_WIDTH, usableHeight, 0.05);
        const backPanel = new THREE.Mesh(backPanelGeometry, gradientMaterial);


        // The space between the shelves is the usable height divided by the number of gaps between shelves.
        const spaceBetweenShelves = usableHeight / (NUM_SHELVES - 1);


        // Create shelves with edge lines
        for (let i = 0; i < NUM_SHELVES; i++) {
            const shelf = new THREE.Mesh(shelfGeometry, gradientMaterial);
            // Position each shelf at the correct height based on the number of shelves.
            shelf.position.y = (NUM_SHELVES - 1 - i) * spaceBetweenShelves;
            shelf.position.z = -0.55;
            scene.add(shelf);
            addEdgeLines(shelfGeometry, shelf.position, edgeMaterial, scene);
        }

        // Adjust the side panels' x position to align with the edges of the shelves
        const sidePanelOffset = BOOKCASE_WIDTH / 2; // Half the width to position on each side
        const leftSidePanel = new THREE.Mesh(sidePanelGeometry, gradientMaterial);
        leftSidePanel.position.x = -sidePanelOffset;
        leftSidePanel.position.y = sidePanelYPosition; // Aligned with the bottom of the bookcase
        leftSidePanel.position.z = -0.55;
        scene.add(leftSidePanel);
        addEdgeLines(sidePanelGeometry, leftSidePanel.position, edgeMaterial, scene);

        const rightSidePanel = new THREE.Mesh(sidePanelGeometry, gradientMaterial);
        rightSidePanel.position.x = sidePanelOffset;
        rightSidePanel.position.y = sidePanelYPosition; // Aligned with the bottom of the bookcase
        rightSidePanel.position.z = -0.55;
        scene.add(rightSidePanel);
        addEdgeLines(sidePanelGeometry, rightSidePanel.position, edgeMaterial, scene);

        // Set the back panel's y position so the top aligns with the bottom of the top panel
        backPanel.position.y = usableHeight / 2; // Centered in its local space
        backPanel.position.z = -SHELF_DEPTH / 2; // Align with the depth of the side panels
        scene.add(backPanel);
        addEdgeLines(backPanelGeometry, backPanel.position, edgeMaterial, scene);

    
        // Adjust camera position based on bookcase size
        camera.position.z = BOOKCASE_WIDTH;
        camera.position.y = BOOKCASE_HEIGHT / 2;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI;
        controls.minPolarAngle = 0;
        controls.update();

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            controls.dispose();
        };
    }, []);

    // Function to create gradient shader material
    const createGradientMaterial = () => {
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            varying vec2 vUv;
            void main() {
                gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0);
            }
        `;

        const uniforms = {
            topColor: { value: new THREE.Color(0x8B4513) },
            bottomColor: { value: new THREE.Color(0x552211) } // darker shade for the bottom
        };

        return new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
    };

    // Function to add edge lines to a mesh
    const addEdgeLines = (geometry: THREE.BoxGeometry, position: THREE.Vector3Like, material: THREE.LineBasicMaterial, scene: THREE.Scene) => {
        const edgeGeo = new THREE.EdgesGeometry(geometry);
        const edgeLines = new THREE.LineSegments(edgeGeo, material);
        edgeLines.position.copy(position);
        scene.add(edgeLines);
    };

    return <canvas ref={canvasRef} />;
};

export default Scene;
