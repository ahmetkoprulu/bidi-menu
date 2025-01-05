'use client';

import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>AR Menu System</title>
                <meta name="description" content="Interactive AR Menu System" />
            </head>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
} 