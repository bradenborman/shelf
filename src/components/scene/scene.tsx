import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import wood from '../../images/wood2.jpg';
import gokuImage from '../../images/goku.jpg';
import gohanImage from '../../images/gohan.png';
import buu from "../../images/buu.jpg";
import vegeta from "../../images/vegeta.jpg";
import piccoloImage from "../../images/piccolo.png";
import cellImage from "../../images/cell.png";
import freezaImage from "../../images/freeza.png";
import andriod16Image from "../../images/andriod-16.png";

import { Figure, Shelf } from 'models/figure';

const NUM_SHELVES = 6;
const BOOKCASE_HEIGHT = 6;
const BOOKCASE_WIDTH = 6;
const SHELF_DEPTH = 2;


const shelves: Shelf[] = [{
    index: 1,
    figures: [
        {
            path: gokuImage,
            color: "#5D1C19",
            boxWidth: 0.55,
            boxHeight: 0.7,
            boxDepth: .2,
            shiftOverride: 0
        },
        {
            path: gohanImage,
            color: "#394159",
            boxWidth: 0.55,
            boxHeight: 0.7,
            boxDepth: .15,
            shiftOverride: 0.55
        },
        {
            path: buu,
            color: "#644145",
            boxWidth: 0.8,
            boxHeight: 0.85,
            boxDepth: .4,
            shiftOverride: 0.55
        },
        {
            path: vegeta,
            color: "#5C5C3C",
            boxWidth: 0.55,
            boxHeight: 0.7,
            boxDepth: .15,
            shiftOverride: 0.62
        }
    ]
},
{
    index: 2,
    figures: [
        {
            path: piccoloImage,
            color: "#1C4421",
            boxWidth: 0.55,
            boxHeight: 0.7,
            boxDepth: .15,
            shiftOverride: 0
        },
        {
            path: cellImage,
            color: "#252626",
            boxWidth: 0.66,
            boxHeight: 0.82,
            boxDepth: .25,
            shiftOverride: .6
        },
        {
            path: freezaImage,
            color: "#372F39",
            boxWidth: 0.5,
            boxHeight: 0.7,
            boxDepth: .133,
            shiftOverride: .63
        }
    ]
},
{
    index: 3,
    figures: [
        {
            path: andriod16Image,
            color: "#555B4F",
            boxWidth: 0.6,
            boxHeight: 0.8,
            boxDepth: .22,
            shiftOverride: 0
        }
    ]
}]

const Scene: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [panup, setPanUp] = useState<boolean>(true);

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

        // const gradientMaterial = createGradientMaterial();
        const grainyMaterial = createGrainyMaterial();

        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        const usableHeight = BOOKCASE_HEIGHT - 0.1;
        const shelfGeometry = new THREE.BoxGeometry((BOOKCASE_WIDTH - 0.1), 0.1, SHELF_DEPTH);
        // Create and position side panels with edge lines
        const sidePanelHeight = BOOKCASE_HEIGHT;
        const sidePanelGeometry = new THREE.BoxGeometry(0.1, sidePanelHeight, SHELF_DEPTH);

        const sidePanelYPosition = sidePanelHeight / 2 - 0.05; // Half the height - thickness of the bottom panel
        // Adjust the backPanelGeometry to use the updated BOOKCASE_WIDTH and BOOKCASE_HEIGHT
        const backPanelGeometry = new THREE.BoxGeometry(BOOKCASE_WIDTH, usableHeight, 0.05);
        const backPanel = new THREE.Mesh(backPanelGeometry, grainyMaterial);

        const bookcaseCenter = new THREE.Vector3(0, BOOKCASE_HEIGHT / 2, 0);




        // The space between the shelves is the usable height divided by the number of gaps between shelves.
        const spaceBetweenShelves = usableHeight / (NUM_SHELVES - 1);


        // Create shelves with edge lines
        for (let i = 0; i < NUM_SHELVES; i++) {
            const shelf = new THREE.Mesh(shelfGeometry, grainyMaterial);
            // Position each shelf at the correct height based on the number of shelves.
            shelf.position.y = (NUM_SHELVES - 1 - i) * spaceBetweenShelves;
            shelf.position.z = -0.55;
            scene.add(shelf);
            addEdgeLines(shelfGeometry, shelf.position, edgeMaterial, scene);
        }

        // Adjust the side panels' x position to align with the edges of the shelves
        const sidePanelOffset = BOOKCASE_WIDTH / 2; // Half the width to position on each side
        const leftSidePanel = new THREE.Mesh(sidePanelGeometry, grainyMaterial);
        leftSidePanel.position.x = -sidePanelOffset;
        leftSidePanel.position.y = sidePanelYPosition; // Aligned with the bottom of the bookcase
        leftSidePanel.position.z = -0.55;
        scene.add(leftSidePanel);
        addEdgeLines(sidePanelGeometry, leftSidePanel.position, edgeMaterial, scene);

        const rightSidePanel = new THREE.Mesh(sidePanelGeometry, grainyMaterial);
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



        // Function to add a box to the scene
        const addFigureBox = (figure: Figure, shelfRow: number, index: number) => {
            const offset = 0.1; // Distance from the front of the shelf
            const shelfIndex = NUM_SHELVES - (shelfRow + 1); // The index of the shelf where to place the figure
            const spaceBetweenBoxes = 0.2; // Space between each box

            // Load the texture for the box
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(figure.path);

            // Create materials, with the texture for the front side
            const materials = [
                new THREE.MeshLambertMaterial({ color: figure.color }),
                new THREE.MeshLambertMaterial({ color: figure.color }),
                new THREE.MeshLambertMaterial({ color: figure.color }),
                new THREE.MeshLambertMaterial({ color: figure.color }),
                new THREE.MeshLambertMaterial({ map: texture }), // Front side
                new THREE.MeshLambertMaterial({ color: figure.color }),
            ];

            // Create the geometry and mesh for the box
            const boxGeometry = new THREE.BoxGeometry(figure.boxWidth, figure.boxHeight, figure.boxDepth);
            const boxMesh = new THREE.Mesh(boxGeometry, materials);

            // Calculate Y position based on the shelf index
            const boxPositionY = (shelfIndex * spaceBetweenShelves) - 0.05 + (figure.boxHeight / 2) + .08;

            // Calculate X position based on the index of the figure in the array
            const boxPositionX = -BOOKCASE_WIDTH / 2 + figure.boxWidth / 2 + index * (figure.shiftOverride + spaceBetweenBoxes) + .3;

            const boxPositionZ = (-SHELF_DEPTH / 2 + .1 / 2 + offset) + (figure.boxDepth < .3 ? 1 : (.9))

            // Set the position and add the box to the scene
            boxMesh.position.set(boxPositionX, boxPositionY, boxPositionZ);
            scene.add(boxMesh);
        };

        const buildShelf = (shelf: Shelf) => {
            shelf.figures.forEach((figure, index) => {
                addFigureBox(figure, shelf.index, index);
            });
        }

        // Iterate over the figures and add them to the scene
        shelves.forEach((shelf) => {
            buildShelf(shelf);
        });


        // Create and position the camera
        camera.position.set(bookcaseCenter.x, (bookcaseCenter.y + 1.2), BOOKCASE_WIDTH * .8); // Zoomed out based on bookcase width
        camera.lookAt(bookcaseCenter);

        // Create and configure OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.copy(bookcaseCenter); // Focus on the center of the bookcase
        controls.enableDamping = true; // Enable dynamic damping
        controls.dampingFactor = 0.25; // Adjust the damping factor as needed
        controls.zoomSpeed = 2.0; // Adjust the zoom speed as needed
        controls.enableZoom = false
        controls.enablePan = false; // Disable panning
        controls.maxPolarAngle = Math.PI; // Set maximum polar angle to look vertically downwards
        controls.minPolarAngle = 0; // Set minimum polar angle to look vertically upwards

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update(); // Required when damping is enabled
            renderer.render(scene, camera);

            if (camera.position.y < (BOOKCASE_HEIGHT - 1))
                camera.position.setY(camera.position.y + 0.008)
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
            topColor: { value: new THREE.Color(0xC0C0C0) }, // Light gray
            bottomColor: { value: new THREE.Color(0xA0A0A0) } // Darker shade of gray
        };


        return new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
    };

    const createGrainyMaterial = () => {
        const textureLoader = new THREE.TextureLoader();
        // Load grain texture
        const grainTexture = textureLoader.load(wood);
        grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
        grainTexture.repeat.set(4, 4);

        // Create a material using the texture
        const grainyMaterial = new THREE.MeshStandardMaterial({
            map: grainTexture,
            roughness: 1, // Adjust for a rougher surface
            metalness: 0 // Non-metallic surface
        });

        return grainyMaterial;
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
