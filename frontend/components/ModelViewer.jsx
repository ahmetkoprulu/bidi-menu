'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

function Model({ url }) {
    const modelRef = useRef();
    const { scene, camera } = useThree();

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
            // Center and scale the model
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            gltf.scene.scale.multiplyScalar(scale);
            gltf.scene.position.sub(center.multiplyScalar(scale));

            // Add the model to our ref
            modelRef.current.add(gltf.scene);

            // Position camera to view the model
            camera.position.set(2, 2, 2);
            camera.lookAt(0, 0, 0);
        });

        return () => {
            // Cleanup
            if (modelRef.current) {
                while (modelRef.current.children.length > 0) {
                    modelRef.current.remove(modelRef.current.children[0]);
                }
            }
        };
    }, [url, camera]);

    useFrame(() => {
        if (modelRef.current) {
            modelRef.current.rotation.y += 0.005; // Auto-rotate
        }
    });

    return <group ref={modelRef} />;
}

function Controls() {
    const { camera, gl: { domElement } } = useThree();

    useEffect(() => {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const handleMouseDown = (e) => {
            isDragging = true;
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            const deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                    deltaMove.y * (0.01),
                    deltaMove.x * (0.01),
                    0,
                    'XYZ'
                ));

            camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, camera.quaternion);

            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        const handleWheel = (e) => {
            camera.position.multiplyScalar(e.deltaY > 0 ? 1.1 : 0.9);
        };

        domElement.addEventListener('mousedown', handleMouseDown);
        domElement.addEventListener('mousemove', handleMouseMove);
        domElement.addEventListener('mouseup', handleMouseUp);
        domElement.addEventListener('mouseleave', handleMouseUp);
        domElement.addEventListener('wheel', handleWheel);

        return () => {
            domElement.removeEventListener('mousedown', handleMouseDown);
            domElement.removeEventListener('mousemove', handleMouseMove);
            domElement.removeEventListener('mouseup', handleMouseUp);
            domElement.removeEventListener('mouseleave', handleMouseUp);
            domElement.removeEventListener('wheel', handleWheel);
        };
    }, [camera, domElement]);

    return null;
}

export default function ModelViewer({ url }) {
    return (
        <Canvas
            camera={{ position: [2, 2, 2], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
        >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Model url={url} />
            <Controls />
        </Canvas>
    );
}