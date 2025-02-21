'use client';

import React, { useEffect, useState, useRef } from 'react';

const OptimizedModelViewer = ({
    src,
    poster,
    'ios-src': iosSrc,
    alt,
    style,
    id,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);
    const modelViewerRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const setupModelViewer = () => {
            const modelViewer = modelViewerRef.current;
            if (!modelViewer) return;

            const handleProgress = (event) => {
                if (!mounted) return;
                const progress = event.detail.totalProgress * 100;
                setLoadingProgress(progress);
                console.log('Loading progress:', progress); // Debug log
            };

            const handleLoad = () => {
                if (!mounted) return;
                console.log('Model loaded successfully'); // Debug log
                setIsLoading(false);
                setError(null);
            };

            const handleError = (error) => {
                if (!mounted) return;
                console.error('Error loading model:', error);
                setError('Failed to load model');
                setIsLoading(false);
            };

            // Clean up existing listeners first
            modelViewer.removeEventListener('progress', handleProgress);
            modelViewer.removeEventListener('load', handleLoad);
            modelViewer.removeEventListener('error', handleError);

            // Add new listeners
            modelViewer.addEventListener('progress', handleProgress);
            modelViewer.addEventListener('load', handleLoad);
            modelViewer.addEventListener('error', handleError);

            // Force a load attempt
            if (modelViewer.src !== src) {
                modelViewer.src = src;
            }

            return () => {
                if (modelViewer) {
                    modelViewer.removeEventListener('progress', handleProgress);
                    modelViewer.removeEventListener('load', handleLoad);
                    modelViewer.removeEventListener('error', handleError);
                }
            };
        };

        const cleanup = setupModelViewer();

        return () => {
            mounted = false;
            if (cleanup) cleanup();
        };
    }, [src]);

    // Reset loading state when src changes
    useEffect(() => {
        setIsLoading(true);
        setLoadingProgress(0);
        setError(null);
    }, [src]);

    return (
        <div className="relative" style={style}>
            <model-viewer
                ref={modelViewerRef}
                src={src}
                poster={poster}
                ios-src={iosSrc}
                alt={alt || 'A 3D model'}
                loading="lazy"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                exposure="1"
                environment-image="neutral"
                style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6' }}
                {...props}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">{Math.round(loadingProgress)}% loaded</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}
            </model-viewer>
        </div>
    );
};

export default OptimizedModelViewer; 