'use client';

import React, { useEffect, useState } from 'react';
import { menuService } from '@/services/menu-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

export default function MenuViewLayout({ children, params }) {
    const [metadata, setMetadata] = useState(null);
    const { id } = React.use(params);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('item');

        const fetchMetadata = async () => {
            try {
                const menuData = await menuService.getMenu(id);
                let title = menuData.name;
                let description = `Explore our interactive 3D menu`;
                let image = '';

                if (itemId) {
                    // Find the specific item
                    const item = menuData.categories?.flatMap(category =>
                        category.menuItems?.filter(item => item.status !== 'inactive') || []
                    ).find(item => item.id === itemId);

                    if (item) {
                        title = `${item.name} - ${menuData.name}`;
                        description = `Check out ${item.name} in 3D on our interactive AR menu!`;
                        image = item.modelInfo?.thumbnail ?
                            `${API_URL}${item.modelInfo.thumbnail}.png` :
                            ''; // Default image if needed
                    }
                }

                setMetadata({ title, description, image });

                // Dynamically update meta tags
                updateMetaTags(title, description, image);
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };

        fetchMetadata();
    }, [id]);

    const updateMetaTags = (title, description, image) => {
        // Update title
        document.title = title;

        // Helper function to update or create meta tag
        const setMetaTag = (property, content) => {
            let element = document.querySelector(`meta[property="${property}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute('property', property);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // OpenGraph tags
        setMetaTag('og:title', title);
        setMetaTag('og:description', description);
        if (image) {
            setMetaTag('og:image', image);
        }
        setMetaTag('og:type', 'website');
        setMetaTag('og:site_name', 'AR Menu');

        // Twitter Card tags
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', description);
        if (image) {
            setMetaTag('twitter:image', image);
        }

        // WhatsApp specific
        setMetaTag('og:whatsapp:title', title);
        setMetaTag('og:whatsapp:description', description);

        // Telegram specific
        setMetaTag('telegram:title', title);
        setMetaTag('telegram:description', description);
        if (image) {
            setMetaTag('telegram:image', image);
        }
    };

    return children;
} 