'use client';

import { useState, useEffect } from 'react';
import { modelService } from '@/services/model-service';
import DashedButton from '@/components/buttons/DashedButton';
import { XMarkIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';
import Script from 'next/script';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || '';

export default function ModelSelect({ value, selectedModel, onChange, clientId, className }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        glbFile: null,
        usdzFile: null,
        thumbnail: null
    });

    // Add model-viewer script
    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            fetchModels();
        }
    }, [isModalOpen]);

    useEffect(() => {
        // Cleanup preview URL when component unmounts
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            const data = await modelService.getModels(clientId);
            setModels(data);
        } catch (error) {
            console.error('Error fetching models:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModelSelect = (model) => {
        onChange(model);
        setIsModalOpen(false);
    };

    const handleRemove = () => {
        onChange(null);
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [type]: file
            }));

            // Create preview URL for GLB file
            if (type === 'glbFile') {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.glbFile || !formData.usdzFile) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setUploading(true);
            // If no thumbnail is set, capture the current view
            if (!formData.thumbnail) {
                const modelViewer = document.getElementById('model-preview');
                if (modelViewer) {
                    const screenshot = modelViewer.toDataURL('image/png');
                    // Convert base64 to blob
                    const res = await fetch(screenshot);
                    const blob = await res.blob();
                    formData.thumbnail = new File([blob], `${formData.name}-thumbnail.png`, { type: 'image/png' });
                }
            }
            const newModel = await modelService.createModel(clientId, formData);
            setModels(prev => [...prev, newModel]);
            setIsCreating(false);
            setFormData({
                name: '',
                glbFile: null,
                usdzFile: null,
                thumbnail: null
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={className}>
            {selectedModel ? (
                <div className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden group">
                    <img
                        src={selectedModel.thumbnail
                            ? (CDN_DOMAIN
                                ? `${CDN_DOMAIN}/${selectedModel.thumbnail}`
                                : `${BASE_URL}${selectedModel.thumbnail}.png`)
                            : '/placeholder-model.png'}
                        alt={selectedModel.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                        <button
                            onClick={handleRemove}
                            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            ) : (
                <label className="flex flex-col items-center gap-1 p-2 border-2 border-dashed 
                border-gray-300 rounded-lg text-xs text-gray-500 cursor-pointer
                hover:border-indigo-500 hover:text-indigo-500 transition-colors w-24 h-24 items-center justify-center"
                    onClick={() => setIsModalOpen(true)}
                >
                    <CubeTransparentIcon className="w-8 h-8" />
                    Upload
                </label>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {isCreating ? 'Create New Model' : 'Select Model'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsCreating(false);
                                    setError('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {isCreating ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Model Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">GLB File</label>
                                            <input
                                                type="file"
                                                accept=".glb"
                                                onChange={(e) => handleFileChange(e, 'glbFile')}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">USDZ File</label>
                                            <input
                                                type="file"
                                                accept=".usdz"
                                                onChange={(e) => handleFileChange(e, 'usdzFile')}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                                        {previewUrl ? (
                                            <div className="relative">
                                                <model-viewer
                                                    id="model-preview"
                                                    src={previewUrl}
                                                    auto-rotate
                                                    camera-controls
                                                    shadow-intensity="1"
                                                    style={{ width: '100%', height: '300px' }}
                                                ></model-viewer>
                                                <div className="absolute bottom-2 right-2 flex space-x-2">
                                                    {formData.thumbnail && (
                                                        <div className="px-3 py-1.5 text-sm text-white bg-green-500 bg-opacity-50 rounded-md">
                                                            Thumbnail Set
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const modelViewer = document.getElementById('model-preview');
                                                            if (modelViewer) {
                                                                const screenshot = modelViewer.toDataURL('image/png');
                                                                // Convert base64 to blob
                                                                const res = await fetch(screenshot);
                                                                const blob = await res.blob();
                                                                const thumbnailFile = new File([blob], `${formData.name || 'model'}-thumbnail.png`, { type: 'image/png' });
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    thumbnail: thumbnailFile
                                                                }));
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 text-sm font-medium text-white bg-black bg-opacity-50 rounded-md hover:bg-opacity-70 transition-opacity"
                                                    >
                                                        Set Thumbnail
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-[300px] text-gray-400">
                                                Upload a GLB file to preview
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreating(false);
                                            if (previewUrl) {
                                                URL.revokeObjectURL(previewUrl);
                                                setPreviewUrl(null);
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {uploading ? 'Creating...' : 'Create Model'}
                                    </button>
                                </div>
                            </form>
                        ) : loading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {models.map((model) => (
                                    <div
                                        key={model.id}
                                        onClick={() => handleModelSelect(model)}
                                        className="cursor-pointer group relative"
                                    >
                                        <div className="aspect-square rounded-lg border border-gray-200 overflow-hidden">
                                            <img
                                                src={model.thumbnail
                                                    ? (CDN_DOMAIN
                                                        ? `${CDN_DOMAIN}/${model.thumbnail}`
                                                        : `${BASE_URL}${model.thumbnail}.png`)
                                                    : '/placeholder-model.png'}
                                                alt={model.name}
                                                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                            />
                                        </div>
                                        <p className="mt-1 text-sm text-gray-900">{model.name}</p>
                                    </div>
                                ))}

                                <DashedButton
                                    onClick={() => setIsCreating(true)}
                                    className="aspect-square flex flex-col items-center justify-center"
                                >
                                    <span className="text-2xl mb-1">+</span>
                                    <span className="text-sm">Upload New Model</span>
                                </DashedButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 