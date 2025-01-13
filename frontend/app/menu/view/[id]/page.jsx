'use client';

import React, { useEffect, useRef, useState } from 'react';
import { menuService } from '@/services/menu-service';

const API_URL = process.env.BASE_URL || 'https://192.168.1.37:8000';

const ModelViewer = ({ item, onClose }) => {
    const modelRef = useRef(null);

    if (!item?.modelInfo) return null;

    const glbUrl = `${API_URL}${item.modelInfo.glbFile}.glb`;
    const usdzUrl = `${API_URL}${item.modelInfo.usdzFile}.usdz`;
    const thumbnailUrl = `${API_URL}${item.modelInfo.thumbnail}.png`;

    const handleModelLoad = () => {
        console.log('Model loaded successfully');
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
            poster={thumbnailUrl}
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
        />
    );
};

const MenuItemCard = ({ item, isSelected, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`flex-shrink-0 w-[160px] sm:w-48 bg-white rounded-lg shadow-sm border transition-all cursor-pointer
                ${isSelected ? 'border-black scale-95' : 'border-gray-100 hover:border-gray-200'}`}
        >
            {item.modelInfo?.thumbnail ? (
                <div className="relative h-24 sm:h-32 bg-gray-50 rounded-t-lg overflow-hidden">
                    <img
                        src={`${API_URL}${item.modelInfo.thumbnail}.png`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="h-24 sm:h-32 bg-gray-50 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                </div>
            )}
            <div className="p-2 sm:p-3 space-y-0.5 sm:space-y-1">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500">{item.category}</span>
                    <span className="text-xs sm:text-sm font-medium">${item.price}</span>
                </div>
            </div>
        </div>
    );
};

const CategoryTab = ({ category, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all
            ${isSelected
                ? 'bg-white text-black'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
    >
        {category}
    </button>
);

const ARMenuView = ({ menuId }) => {
    const [menu, setMenu] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);
    const [isLoading, setIsLoading] = useState(true);
    const [isARMode, setIsARMode] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const scrollContainerRef = useRef(null);
    const categoryScrollRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const startCamera = async () => {
        try {
            if (streamRef.current) return; // Camera already running

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: window.innerWidth },
                    height: { ideal: window.innerHeight }
                },
                audio: false
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraError(null);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraError('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }
    };

    useEffect(() => {
        // Start camera when component mounts
        startCamera();

        // Clean up camera when component unmounts
        return () => {
            stopCamera();
        };
    }, []);

    const handleARButtonClick = async () => {
        const modelViewer = document.querySelector('model-viewer');
        if (modelViewer) {
            // Stop the camera before activating AR
            stopCamera();
            setIsARMode(true);
            try {
                await modelViewer.activateAR();
            } catch (error) {
                console.error('Error activating AR:', error);
                // If AR fails, restart the camera
                startCamera();
                setIsARMode(false);
            }
        }
    };

    // Handle AR mode exit
    useEffect(() => {
        if (!isARMode) {
            startCamera();
        }
    }, [isARMode]);

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
        fetchMenu();
    }, [menuId]);

    useEffect(() => {
        // Filter items based on selected category
        setFilteredItems(
            selectedCategory === 'All'
                ? menuItems
                : menuItems.filter(item => item.category === selectedCategory)
        );
    }, [selectedCategory, menuItems]);

    const fetchMenu = async () => {
        try {
            const menuData = await menuService.getMenu(menuId);
            setMenu(menuData);

            // Flatten menu items and extract categories
            const items = menuData.categories?.flatMap(category =>
                category.menuItems?.filter(item => item.status !== 'inactive' && item.modelInfo)
                    .map(item => ({ ...item, category: category.name })) || []
            ) || [];

            // Extract unique categories
            const uniqueCategories = ['All', ...new Set(items.map(item => item.category))];

            setCategories(uniqueCategories);
            setMenuItems(items);
            setFilteredItems(items);
            if (items.length > 0) {
                setSelectedItem(items[0]);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setIsLoading(false);
        }
    };

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
        }
    };

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            checkScroll();
            scrollContainer.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            }
        };
    }, [menuItems]);

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

    return (
        <main className="relative min-h-screen">
            <div className="fixed inset-0 bg-black z-50">
                {/* Camera Background */}
                {!isARMode && (
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        playsInline
                        muted
                    />
                )}

                <div className="relative h-full">
                    {selectedItem && (
                        <div className="absolute top-0 left-0 right-0 z-10">
                            <div className="bg-gradient-to-b from-black/50 to-transparent p-3 sm:p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-white">
                                        <h3 className="text-base sm:text-lg font-semibold">{selectedItem.name}</h3>
                                        <p className="text-xs sm:text-sm opacity-80">${selectedItem.price}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="p-2 text-white/80 hover:text-white"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                {selectedItem.modelInfo && (
                                    <button
                                        onClick={handleARButtonClick}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-black rounded-full hover:bg-white text-xs sm:text-sm font-medium transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                        View in AR
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Show error message if camera fails */}
                    {cameraError && (
                        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
                            {cameraError}
                        </div>
                    )}

                    {selectedItem && selectedItem.modelInfo && (
                        <ModelViewer
                            item={selectedItem}
                            onClose={() => {
                                setSelectedItem(null);
                                setIsARMode(false);
                            }}
                        />
                    )}

                    {/* Menu Section */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/90 to-transparent pb-safe">
                        {/* Category Tabs */}
                        <div className="px-3 sm:px-4 mb-3 sm:mb-4">
                            <div className="overflow-x-auto hide-scrollbar" ref={categoryScrollRef}>
                                <div className="flex gap-2 py-2">
                                    {categories.map((category) => (
                                        <CategoryTab
                                            key={category}
                                            category={category}
                                            isSelected={selectedCategory === category}
                                            onClick={() => setSelectedCategory(category)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="relative px-3 sm:px-4">
                            {/* Left Fade */}
                            {canScrollLeft && (
                                <div className="absolute left-3 sm:left-4 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-r from-black/90 to-transparent z-10 pointer-events-none" />
                            )}

                            {/* Right Fade */}
                            {canScrollRight && (
                                <div className="absolute right-3 sm:right-4 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-black/90 to-transparent z-10 pointer-events-none" />
                            )}

                            {/* Scroll Indicator */}
                            {canScrollRight && (
                                <div className="absolute -top-6 right-4 text-white/80 flex items-center gap-2 text-xs sm:text-sm animate-pulse">
                                    <span className="hidden sm:inline">Scroll for more</span>
                                    <span className="sm:hidden">More</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            )}

                            <div
                                ref={scrollContainerRef}
                                className="overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
                            >
                                <div className="flex gap-2 sm:gap-3">
                                    {filteredItems.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            isSelected={selectedItem?.id === item.id}
                                            onClick={() => setSelectedItem(item)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .pb-safe {
                    padding-bottom: env(safe-area-inset-bottom, 1rem);
                }
            `}</style>
        </main>
    );
};

export default function ARMenuPage({ params }) {
    const { id } = React.use(params);
    return <ARMenuView menuId={id} />;
}