'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import Script from 'next/script';
import { registerServiceWorker } from '@/utils/service-worker';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return (
        <html lang="en">
            <head>
                <title>AR Menu System</title>
                <meta name="description" content="Interactive AR Menu System" />
                <Script
                    src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
                    type="module"
                    strategy="beforeInteractive"
                />
            </head>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
} 