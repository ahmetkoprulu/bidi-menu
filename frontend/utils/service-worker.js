export const registerServiceWorker = async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/model-service-worker.js');
            console.log('ServiceWorker registration successful:', registration);
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    }
}; 