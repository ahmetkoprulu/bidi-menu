'use client';

import React, { useEffect, useRef, useState } from 'react';
import { menuService } from '@/services/menu-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || '';

// Cache for loaded models
const modelCache = new Map();

const ModelViewer = ({ item, menuId, onClose }) => {
    const modelRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadError, setLoadError] = useState(null);
    const [showShareSuccess, setShowShareSuccess] = useState(false);
    const modelKey = `${item?.id}-${item?.modelInfo?.glbFile}`;

    if (!item?.modelInfo) return null;

    // Use CDN URLs if available, fallback to API URLs
    const glbUrl = CDN_DOMAIN ? `${CDN_DOMAIN}/${item.modelInfo.glbFile}` : `${API_URL}${item.modelInfo.glbFile}.glb`;
    const usdzUrl = CDN_DOMAIN ? `${CDN_DOMAIN}/${item.modelInfo.usdzFile}` : `${API_URL}${item.modelInfo.usdzFile}.usdz`;
    const thumbnailUrl = CDN_DOMAIN ? `${CDN_DOMAIN}/${item.modelInfo.thumbnail}` : `${API_URL}${item.modelInfo.thumbnail}.png`;

    useEffect(() => {
        // Reset states when item changes
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadError(null);

        // Check if model is already cached
        if (modelCache.has(modelKey)) {
            console.log('Using cached model:', modelKey);
            setIsLoading(false);
            setLoadingProgress(100);
            return;
        }

        // Add event listeners
        const modelViewer = modelRef.current;
        if (modelViewer) {
            modelViewer.addEventListener('progress', handleProgress);
            modelViewer.addEventListener('load', handleModelLoad);
            modelViewer.addEventListener('error', handleError);

            // Preload the model
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'fetch';
            preloadLink.href = glbUrl;
            document.head.appendChild(preloadLink);

            // Cache headers for better browser caching
            fetch(glbUrl, {
                method: 'HEAD',
                headers: {
                    'Cache-Control': 'max-age=31536000',
                },
            }).catch(console.error);
        }

        return () => {
            // Clean up event listeners
            if (modelViewer) {
                modelViewer.removeEventListener('progress', handleProgress);
                modelViewer.removeEventListener('load', handleModelLoad);
                modelViewer.removeEventListener('error', handleError);
            }
        };
    }, [modelKey, glbUrl]);

    const handleModelLoad = () => {
        setIsLoading(false);
        setLoadingProgress(100);
        // Cache the loaded model
        modelCache.set(modelKey, true);
        console.log('Model loaded and cached:', modelKey);
    };

    const handleProgress = (event) => {
        const progress = event.detail?.totalProgress || 0;
        const percentage = Math.round(progress * 100);
        console.log('Loading progress:', percentage);
        setLoadingProgress(percentage);
    };

    const handleError = (error) => {
        setIsLoading(false);
        setLoadError('Error loading 3D model');
        console.error('Error loading model:', error);
        // Remove from cache if loading failed
        modelCache.delete(modelKey);
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/menu/view/${menuId}?item=${item.id}`;
        const shareData = {
            title: `${item.name} - AR Menu`,
            text: `Check out ${item.name} in 3D on our interactive AR menu! You can view it in augmented reality.`,
            url: shareUrl,
        };

        try {
            if (navigator.share && !navigator.userAgent.includes('WhatsApp')) {
                // Use Web Share API for most platforms
                await navigator.share(shareData);
            } else {
                // For WhatsApp and fallback
                const whatsappText = encodeURIComponent(`${shareData.text}\n${shareUrl}`);

                if (navigator.userAgent.includes('WhatsApp')) {
                    // If inside WhatsApp webview, just copy the link
                    await navigator.clipboard.writeText(shareUrl);
                    setShowShareSuccess(true);
                    setTimeout(() => setShowShareSuccess(false), 2000);
                } else {
                    // Try to open WhatsApp if available
                    const whatsappUrl = `whatsapp://send?text=${whatsappText}`;
                    window.location.href = whatsappUrl;

                    // Fallback to web WhatsApp after a short delay if mobile WhatsApp doesn't open
                    setTimeout(() => {
                        if (document.hidden) return; // Don't redirect if WhatsApp opened
                        window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
                    }, 300);
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Fallback to copying the URL
            await navigator.clipboard.writeText(shareUrl);
            setShowShareSuccess(true);
            setTimeout(() => setShowShareSuccess(false), 2000);
        }
    };

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={handleShare}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
                    title="Share item"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                </button>
            </div>

            {showShareSuccess && (
                <div className="absolute top-16 right-4 z-10 bg-black/90 text-white px-4 py-2 rounded-lg text-sm animate-fade-in-out">
                    Link copied!
                </div>
            )}

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
                loading="eager"
                reveal="auto"
                style={{ width: '100%', height: '100%', background: 'transparent' }}
                cache-size="1024"
                max-cache-groups="30"
            />

            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-20 h-20 relative">
                        <svg className="w-full h-full animate-spin text-white" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                            />
                            <circle
                                className="opacity-75"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="40 60"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{loadingProgress}%</span>
                        </div>
                    </div>
                    <p className="mt-3 text-white/90 text-sm">Loading...</p>
                </div>
            )}

            {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm max-w-[80%] text-center">
                        {loadError}
                    </div>
                </div>
            )}
        </div>
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
    const [sharedItemId, setSharedItemId] = useState(null);

    const scrollContainerRef = useRef(null);
    const categoryScrollRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Get shared item ID from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('item');
        if (itemId) {
            setSharedItemId(itemId);
            console.log('Shared item ID:', itemId);
        }
    }, []);

    // Fetch menu data
    useEffect(() => {
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

                // Handle shared item selection
                if (sharedItemId) {
                    const sharedItem = items.find(item => item.id === sharedItemId);
                    if (sharedItem) {
                        setSelectedItem(sharedItem);
                        setSelectedCategory(sharedItem.category);
                        console.log('Found and selected shared item:', sharedItem.name);
                    }
                } else if (items.length > 0) {
                    setSelectedItem(items[0]);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching menu:', error);
                setIsLoading(false);
            }
        };

        fetchMenu();
    }, [menuId, sharedItemId]);

    // Update filtered items when category or items change
    useEffect(() => {
        const newFilteredItems = selectedCategory === 'All'
            ? menuItems
            : menuItems.filter(item => item.category === selectedCategory);

        setFilteredItems(newFilteredItems);

        // Ensure selected item is in filtered items
        if (selectedItem && !newFilteredItems.find(item => item.id === selectedItem.id)) {
            // If shared item exists and category changes, keep the shared item selected
            if (sharedItemId && selectedItem.id === sharedItemId) {
                setSelectedCategory('All');
            } else {
                // Otherwise, select the first item in the filtered list
                setSelectedItem(newFilteredItems[0] || null);
            }
        }
    }, [selectedCategory, menuItems, selectedItem, sharedItemId]);

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
                try {
                    await videoRef.current.play();
                } catch (playError) {
                    if (playError.name === 'AbortError') {
                        console.log('Video play was aborted, likely due to component unmount or navigation');
                        return;
                    }
                    throw playError;
                }
            }
            setCameraError(null);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraError('Unable to access camera. Please check permissions.');
            stopCamera();
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
        let mounted = true;

        const initCamera = async () => {
            if (mounted) {
                await startCamera();
            }
        };

        initCamera();

        return () => {
            mounted = false;
            stopCamera();
        };
    }, []);

    const forceCleanupCamera = () => {
        // Force stop all video tracks
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        // Force cleanup stream reference
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            streamRef.current = null;
        }
        // Force cleanup any other active video streams
        navigator.mediaDevices?.getUserMedia({ video: true })
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
            })
            .catch(() => { });
    };

    const handleARButtonClick = async () => {
        const modelViewer = document.querySelector('model-viewer');
        if (modelViewer) {
            try {
                // Force stop all camera streams
                stopCamera();
                forceCleanupCamera();

                setIsARMode(true);

                // Add event listeners for AR session state
                modelViewer.addEventListener('ar-status', (event) => {
                    if (event.detail.status === 'failed' || event.detail.status === 'not-presenting') {
                        setIsARMode(false);
                    }
                }, { once: true });

                modelViewer.addEventListener('ar-tracking', (event) => {
                    if (event.detail.status === 'not-tracking') {
                        setIsARMode(false);
                    }
                }, { once: true });

                await modelViewer.activateAR();
            } catch (error) {
                console.error('Error activating AR:', error);
                setIsARMode(false);
                // Wait a bit before restarting camera to ensure cleanup is complete
                setTimeout(() => {
                    startCamera();
                }, 500);
            }
        }
    };

    // Handle AR mode exit
    useEffect(() => {
        let timeoutId;

        if (!isARMode) {
            // Add a small delay before restarting camera
            timeoutId = setTimeout(() => {
                startCamera();
            }, 500);
        } else {
            stopCamera();
            forceCleanupCamera();
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isARMode]);

    // Add global event listener for AR session end
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isARMode) {
                setIsARMode(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
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
                            menuId={menuId}
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

                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }

                .animate-fade-in-out {
                    animation: fadeInOut 2s ease-in-out;
                }

                /* Disable text selection and touch interactions */
                main, button, div, h3, p, span {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-touch-callout: none;
                }

                /* Prevent default touch behaviors */
                model-viewer {
                    touch-action: pan-y pinch-zoom;
                    -webkit-tap-highlight-color: transparent;
                }

                /* Disable iOS text size adjustment */
                html {
                    -webkit-text-size-adjust: none;
                    text-size-adjust: none;
                }

                /* Prevent pull-to-refresh and overscroll behaviors */
                body {
                    overscroll-behavior: none;
                    overflow: hidden;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                }
            `}</style>
        </main>
    );
};

export default function ARMenuPage({ params }) {
    const { id } = React.use(params);
    return (
        <>
            <style jsx global>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }

                .animate-fade-in-out {
                    animation: fadeInOut 2s ease-in-out;
                }

                /* Disable text selection and touch interactions */
                main, button, div, h3, p, span {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-touch-callout: none;
                }

                /* Prevent default touch behaviors */
                model-viewer {
                    touch-action: pan-y pinch-zoom;
                    -webkit-tap-highlight-color: transparent;
                }

                /* Disable iOS text size adjustment */
                html {
                    -webkit-text-size-adjust: none;
                    text-size-adjust: none;
                }

                /* Prevent pull-to-refresh and overscroll behaviors */
                body {
                    overscroll-behavior: none;
                    overflow: hidden;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                }
            `}</style>
            <ARMenuView menuId={id} />
        </>
    );
}