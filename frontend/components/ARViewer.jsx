import React, { useEffect } from 'react';

const ARViewer = ({ modelUrl }) => {
    useEffect(() => {
        const scene = document.querySelector('a-scene');

        // Create the 3D model entity
        const model = document.createElement('a-entity');
        model.setAttribute('gltf-model', modelUrl);
        model.setAttribute('scale', '0.5 0.5 0.5');
        model.setAttribute('position', '0 0 -1');  // Position 1 meter in front of the camera
        model.setAttribute('look-at', '[gps-camera]');  // Make model face the camera

        // Add click handler to fix the model's position
        let isPlaced = false;

        model.addEventListener('click', () => {
            if (!isPlaced) {
                // Fix the model's position relative to the world
                const currentPosition = model.getAttribute('position');
                model.removeAttribute('look-at');
                model.setAttribute('position', currentPosition);
                isPlaced = true;
            }
        });

        scene.appendChild(model);

        return () => {
            scene.removeChild(model);
        };
    }, [modelUrl]);

    return (
        <div className="ar-container w-full h-full">
            <a-scene
                embedded
                vr-mode-ui="enabled: false"
                arjs='sourceType: webcam; videoTexture: true; debugUIEnabled: false;'
                renderer="antialias: true; alpha: true"
            >
                <a-camera gps-camera rotation-reader></a-camera>
            </a-scene>
        </div>
    );
};

export default ARViewer; 