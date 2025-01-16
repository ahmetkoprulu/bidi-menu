export const defaultMetadata = {
    title: 'AR Menu Experience',
    description: 'Explore our interactive 3D menu with augmented reality',
    openGraph: {
        type: 'website',
        siteName: 'AR Menu',
        images: [
            {
                url: '/default-preview.png', // You'll need to add a default preview image
                width: 1200,
                height: 630,
                alt: 'AR Menu Preview',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@your_twitter_handle', // Optional: Add your Twitter handle
    },
    other: {
        'og:whatsapp:title': 'AR Menu Experience',
        'og:whatsapp:description': 'Explore our interactive 3D menu with augmented reality',
        'telegram:title': 'AR Menu Experience',
        'telegram:description': 'Explore our interactive 3D menu with augmented reality',
    },
}; 