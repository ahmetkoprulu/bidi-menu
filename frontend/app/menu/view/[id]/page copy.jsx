'use client';

import { useEffect, useRef, useState, use } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.37:8000';

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

const ModelViewer = ({ item, onClose }) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const modelRef = useRef(null);
    const videoRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cameraError, setCameraError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

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

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    if (!item?.model_url) return null;

    const glbUrl = `${API_URL}${item.model_url}`;
    const usdzUrl = `${API_URL}${item.model_url.replace('.glb', '.usdz')}`;

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const handleModelLoad = () => {
        console.log('Model loaded successfully');
    };

    const handleError = (error) => {
        console.error('Error loading model:', error);
        alert('Error loading 3D model. Please try again.');
    };

    return (
        <div className="fixed inset-0 bg-black z-50">
            {/* Camera Background */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
            />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10">
                <div className="bg-gradient-to-b from-black/50 to-transparent p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <p className="text-sm opacity-80">${item.price}</p>
                        </div>
                        {/* <button
                            onClick={() => {
                                stopCamera();
                                onClose();
                            }}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button> */}
                    </div>
                </div>
            </div>

            <div className="relative h-full">
                {isIOS ? (
                    <>
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
                            style={{ width: '100%', height: '100%', background: 'transparent' }}
                            onLoad={handleModelLoad}
                            onError={handleError}
                        >
                            <div slot="poster" className="flex items-center justify-center h-full">
                                <div className="text-white flex items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Loading Model...
                                </div>
                            </div>
                            <div id="lazy-load-poster" slot="poster">
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-white flex items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Loading Model...
                                    </div>
                                </div>
                            </div>
                            <button slot="ar-button" className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg">
                                View in AR
                            </button>
                        </model-viewer>
                    </>
                ) : (
                    <model-viewer
                        ref={modelRef}
                        src={glbUrl}
                        ar
                        ar-modes="webxr scene-viewer"
                        camera-controls
                        auto-rotate
                        shadow-intensity="1"
                        environment-image="neutral"
                        exposure="1"
                        style={{ width: '100%', height: '100%' }}
                        onLoad={handleModelLoad}
                        onError={handleError}
                    >
                        <div slot="poster" className="flex items-center justify-center h-full">
                            <div className="text-white flex items-center gap-2">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                Loading Model...
                            </div>
                        </div>
                        <button
                            slot="ar-button"
                            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                        >
                            View in AR
                        </button>
                    </model-viewer>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const ARMenuView = ({ menuId }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [modelDistances, setModelDistances] = useState({});
    const locationWatchId = useRef(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported');
            alert('Your browser does not support location services. Some features may be limited.');
            return;
        }

        locationWatchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                setUserLocation(newLocation);

                if (menuItems.length > 0) {
                    const distances = {};
                    menuItems.forEach(item => {
                        if (item.latitude && item.longitude) {
                            const distance = calculateDistance(
                                newLocation.latitude,
                                newLocation.longitude,
                                item.latitude,
                                item.longitude
                            );
                            distances[item.id] = { distance };
                        }
                    });
                    setModelDistances(distances);
                }
            },
            (error) => {
                let errorMessage = 'Location error: ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permission denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Position unavailable. Please check your GPS settings.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Request timed out. Please try again.';
                        break;
                    default:
                        errorMessage += error.message || 'Unknown error occurred.';
                }
                console.error(errorMessage);
                alert(errorMessage);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 5000
            }
        );
    };

    useEffect(() => {
        fetchMenuItems();
        startLocationTracking();

        return () => {
            if (locationWatchId.current) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
        };
    }, [menuId]);

    const fetchMenuItems = async () => {
        try {
            const response = await fetch(`${API_URL}/api/menu/items?menu_id=${menuId}`);
            if (!response.ok) throw new Error('Failed to fetch menu items');
            const data = await response.json();
            setMenuItems(data);
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
                    Loading Menu...
                </div>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen bg-gray-100 text-gray-700">
            {/* {userLocation && (
                <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Location Active</span>
                    </div>
                    <div className="mt-1">
                        {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </div>
                    {userLocation.accuracy && (
                        <div className="text-xs text-gray-300 mt-1">
                            Accuracy: ±{Math.round(userLocation.accuracy)}m
                        </div>
                    )}
                </div>
            )} */}

            <div className="p-4 pt-10">
                <h1 className="text-2xl font-bold mb-6">Menu Items</h1>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            <div className="relative h-48">
                                <img
                                    src="/placeholder.svg?height=300&width=300"
                                    alt={item.name}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <p className="text-lg font-bold mb-4">${item.price}</p>

                            {item.model_url && (
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <span>View in 3D/AR</span>
                                    {modelDistances[item.id] && (
                                        <span className="text-sm">
                                            ({Math.round(modelDistances[item.id].distance)}m)
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <ModelViewer
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </main>
    );
};

export default function ARMenuPage({ params }) {
    const { id } = use(params);
    return <ARMenuView menuId={id} />;
}