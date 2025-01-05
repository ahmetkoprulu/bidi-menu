'use client';

import { useEffect, useRef, useState, use } from 'react';
import IOSStyleSelect from '@/components/inputs/IosSelect';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.28:8000';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
};

const ModelViewer = ({ item, items, onClose, onItemChange }) => {
    // const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // const [isLoading, setIsLoading] = useState(true);
    const modelRef = useRef(null);

    if (!item?.model_url) return null;

    const glbUrl = `${API_URL}${item.model_url}`;
    const usdzUrl = `${API_URL}${item.model_url.replace('.glb', '.usdz')}`;

    const handleModelLoad = () => {
        console.log('Model loaded successfully');
        setIsLoading(false);
    };

    const handleError = (error) => {
        console.error('Error loading model:', error);
        alert('Error loading 3D model. Please try again.');
    };

    return (
        <model-viewer
            ref={modelRef}
            src={glbUrl}
            ios-src={usdzUrl}
            ar
            ar-modes="quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1"
            style={{ width: '100%', height: '75%', background: 'transparent' }}
            onLoad={handleModelLoad}
            onError={handleError}
            onARButtonClick={() => startAR()}
            onARTrackingCanceled={() => handleARClose()}
        >
            {/* {isLoading && (
                            <div slot="progress-bar" className="absolute inset-0 flex items-center justify-center">
                                <div className="text-white flex items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Loading Model...</span>
                                </div>
                            </div>
                        )} */}
            <button
                slot="ar-button"
                className="absolute bottom-28 left-1/2 transform -translate-x-1/2 
               px-6 py-2.5 bg-white/90 backdrop-blur-sm text-black 
               rounded-full hover:bg-white 
               text-sm font-medium shadow-lg 
               flex items-center gap-2 transition-all"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                View in AR
            </button>
        </model-viewer>
    )
};

// Update the main component
const ARMenuView = ({ menuId }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const videoRef = useRef(null);
    const selectRef = useRef(null);
    const [cameraError, setCameraError] = useState(null);
    const [isARMode, setIsARMode] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraError('Unable to access camera. Please check permissions.');
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
        document.head.appendChild(script);

        return () => {
            if (script.parentNode) {
                document.head.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        fetchMenuItems();
    }, [menuId]);

    const fetchMenuItems = async () => {
        try {
            const response = await fetch(`${API_URL}/api/menu/items?menu_id=${menuId}`);
            if (!response.ok) throw new Error('Failed to fetch menu items');
            const data = await response.json();
            setMenuItems(data);
            if (data.length > 0) {
                setSelectedItem(data[0]); // Select first item by default
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <span>Loading Menu...</span>
                </div>
            </div>
        );
    }



    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const startAR = () => {
        stopCamera(); // Stop camera before entering AR mode
        setIsARMode(true);
    };

    const handleARClose = () => {
        setIsARMode(false); // This will trigger camera restart via useEffect
    };

    return (
        <main className="relative min-h-screen">

            <div className="fixed inset-0 bg-black z-50">
                {/* Camera Background - Only show when not in AR mode */}
                {!isARMode && (
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                    />
                )}

                {/* Model Viewer Container */}
                <div className="relative h-full">
                    {/* Header */}

                    {selectedItem && (
                        < div className="absolute top-0 left-0 right-0 z-10">
                            <div className="bg-gradient-to-b from-black/50 to-transparent p-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-white">
                                        <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                                        <p className="text-sm opacity-80">${selectedItem.price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedItem && selectedItem.model_url && (
                        <ModelViewer
                            item={selectedItem}
                            onClose={() => setSelectedItem(null)}
                        />
                    )}

                    {/* IOS Select at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center" style={{ height: "25%" }}>
                        <div className="mb-4"> {/* Added wrapper for width control */}
                            <IOSStyleSelect
                                ref={selectRef}
                                options={menuItems.map(item => ({ value: item, label: item.name }))}
                                onChange={setSelectedItem}
                                value={selectedItem}
                            />
                        </div>
                    </div>
                </div>
            </div >
        </main>

    );
};

export default function ARMenuPage({ params }) {
    const { id } = use(params);
    return <ARMenuView menuId={id} />;
}