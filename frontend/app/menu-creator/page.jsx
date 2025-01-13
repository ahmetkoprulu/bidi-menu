'use client';

import { useState, useCallback } from 'react';
import { Camera, Upload, QrCode, Edit, Trash2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import QRCodeModal from '@/components/QRCodeModal';

const API_URL = 'https://192.168.1.37:8000';

export default function MenuCreatorPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [pendingModels, setPendingModels] = useState({});
    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleFiles = useCallback((files) => {
        const newFiles = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: URL.createObjectURL(file)
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, [handleFiles]);

    const nextSlide = () => {
        setCurrentSlide(curr =>
            curr === uploadedFiles.length - 1 ? 0 : curr + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlide(curr =>
            curr === 0 ? uploadedFiles.length - 1 : curr - 1
        );
    };

    const removeFile = useCallback((idToRemove) => {
        setUploadedFiles(prev => {
            const fileToRemove = prev.find(f => f.id === idToRemove);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== idToRemove);
        });
        setCurrentSlide(curr =>
            curr >= uploadedFiles.length - 1 ? Math.max(0, uploadedFiles.length - 2) : curr
        );
    }, [uploadedFiles.length]);

    const startScanning = async () => {
        if (uploadedFiles.length === 0) return;
        setIsLoading(true);

        try {
            // Process each image and combine results
            const allItems = [];
            for (const image of uploadedFiles) {
                const formData = new FormData();
                formData.append('file', image.file);
                const response = await fetch(`${API_URL}/api/menu/upload`, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error(`Error scanning menu: ${response.statusText}`);
                }
                const items = await response.json();
                allItems.push(...items);
            }
            setMenuItems(allItems);
        } catch (error) {
            console.error('Error scanning menu:', error);
            alert('Failed to scan menu. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModelUpload = async (e, menuItemId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('Uploading model for menu item:', menuItemId);

        // Store the model file in pending models
        setPendingModels(prev => ({
            ...prev,
            [menuItemId]: {
                file,
                name: file.name
            }
        }));
    };

    const handleGenerateQR = async () => {
        setIsLoading(true);
        console.log('Generating QR code...');

        try {
            // First, upload all pending models
            for (const [menuItemId, model] of Object.entries(pendingModels)) {
                const formData = new FormData();
                formData.append('file', model.file);

                const modelResponse = await fetch(`${API_URL}/api/models/upload/${menuItemId}`, {
                    method: 'POST',
                    body: formData,
                });

                if (!modelResponse.ok) {
                    throw new Error(`Failed to upload model for ${menuItemId}`);
                }
            }

            // Then generate QR code
            const payload = {
                menuItems: menuItems.map(item => ({
                    ...item,
                    hasModel: !!pendingModels[item.id]
                }))
            };

            const response = await fetch(`${API_URL}/api/menu/generate-qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to generate QR code');
            }

            const data = await response.json();
            console.log('QR code generated:', data);
            setQrData(data);
            setPendingModels({}); // Clear pending models after successful upload
        } catch (error) {
            console.error('Error generating QR:', error);
            alert('Failed to generate QR code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-black">Menu Manager</h1>
                    <div className="flex items-center gap-4">
                        {menuItems.length > 0 && (
                            <button
                                onClick={handleGenerateQR}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <QrCode className="w-4 h-4" />
                                <span className="text-sm">Generate QR</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Split View Container */}
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Panel - Upload and Preview */}
                <div className="w-1/2 border-r p-6 flex flex-col">
                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-6 ${isDragging ? 'border-black bg-gray-50' : 'border-gray-300'
                            } transition-colors mb-4`}
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFiles(e.target.files)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-center space-y-2">
                            <Camera className="w-8 h-8 text-gray-700 mx-auto" />
                            <p className="text-sm text-gray-900">
                                Drag and drop menu images, or click to select
                            </p>
                            <p className="text-xs text-gray-700">
                                Supports: JPG, PNG, PDF
                            </p>
                        </div>
                    </div>

                    {/* Scan Button */}
                    {uploadedFiles.length > 0 && (
                        <button
                            onClick={startScanning}
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span className="text-sm">Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    <span className="text-sm">Start Scanning</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Image Preview Slider */}
                    {uploadedFiles.length > 0 && (
                        <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                            <img
                                src={uploadedFiles[currentSlide].preview}
                                alt={`Preview ${currentSlide + 1}`}
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={() => removeFile(uploadedFiles[currentSlide].id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {uploadedFiles.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {uploadedFiles.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-1.5 h-1.5 rounded-full ${idx === currentSlide ? 'bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Menu Items */}
                <div className="w-1/2 p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {menuItems.map((item) => (
                            <div key={item.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="font-medium text-black">{item.name}</h3>
                                        <p className="text-sm text-gray-900 mt-1">{item.description}</p>
                                        <p className="text-sm font-medium mt-2 text-black">${item.price}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-gray-700 hover:text-black rounded-md">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-700 hover:text-red-600 rounded-md">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Model Upload */}
                                <div className="mt-4">
                                    {!pendingModels[item.id] ? (
                                        <div className="group relative">
                                            <label className="flex items-center gap-2 px-4 py-3 bg-white text-sm text-gray-900 rounded-lg cursor-pointer hover:bg-gray-50 border border-dashed border-gray-200 transition-all">
                                                <Upload className="w-4 h-4" />
                                                <span>Add 3D Model</span>
                                                <span className="text-xs text-gray-700">.glb, .gltf</span>
                                                <input
                                                    type="file"
                                                    accept=".glb,.gltf"
                                                    onChange={(e) => handleModelUpload(e, item.id)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-black truncate">
                                                            {pendingModels[item.id].name}
                                                        </p>
                                                        <p className="text-xs text-gray-700">
                                                            3D Model
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleModelUpload(null, item.id)}
                                                        className="p-1.5 text-gray-700 hover:text-black rounded"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPendingModels(prev => {
                                                                const next = { ...prev };
                                                                delete next[item.id];
                                                                return next;
                                                            });
                                                        }}
                                                        className="p-1.5 text-gray-700 hover:text-red-600 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {menuItems.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">
                                    No menu items yet. Upload images and start scanning!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {qrData && (
                <QRCodeModal
                    qrData={qrData}
                    onClose={() => setQrData(null)}
                />
            )}
        </div>
    );
} 