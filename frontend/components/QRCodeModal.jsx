'use client';

import { useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import Image from 'next/image';

export default function QRCodeModal({ qrData, onClose }) {
    const [imageError, setImageError] = useState(false);

    const handleDownload = async () => {
        try {
            const response = await fetch(`https://192.168.1.28:8000${qrData.qr_code_url}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'menu-qr-code.png';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try again.');
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Menu QR Code',
                    text: 'Check out this menu in AR!',
                    url: qrData.menu_url
                });
            } else {
                await navigator.clipboard.writeText(qrData.menu_url);
                alert('Menu URL copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">QR Code Generated</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
                        {!imageError ? (
                            <Image
                                src={`https://localhost:8000${qrData.qr_code_url}`}
                                alt="Menu QR Code"
                                fill
                                className="object-contain"
                                onError={() => setImageError(true)}
                                unoptimized
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Failed to load QR code
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 text-center">
                        Scan this QR code to view the menu in AR
                    </p>

                    <div className="flex space-x-4">
                        <button
                            onClick={handleDownload}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="h-5 w-5" />
                            <span>Download</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Share2 className="h-5 w-5" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 