'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { modelService } from '@/services/model-service';
import { XMarkIcon, PlusIcon, CubeTransparentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';
const CDN_DOMAIN = process.env.NEXT_PUBLIC_CDN_DOMAIN || '';

function ModelsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        glbFile: null,
        usdzFile: null,
        thumbnail: null
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modelToDelete, setModelToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Add model-viewer script
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
        fetchModels();
    }, [clientId]);

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
            setError('Failed to load models');
        } finally {
            setLoading(false);
        }
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
            setError('Please fill in all required fields');
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
            setIsModalOpen(false);
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

    const handleViewModel = (model) => {
        setSelectedModel(model);
        setIsViewerModalOpen(true);
    };

    const handleDeleteModel = async (modelId) => {
        try {
            setIsDeleting(true);
            await modelService.deleteModel(modelId);
            setModels(prev => prev.filter(model => model.id !== modelId));
            if (isViewerModalOpen && selectedModel?.id === modelId) {
                setIsViewerModalOpen(false);
            }
            setIsDeleteModalOpen(false);
            setModelToDelete(null);
        } catch (error) {
            setError('Failed to delete model');
            console.error('Error deleting model:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (model, e) => {
        if (e) e.stopPropagation();
        setModelToDelete(model);
        setIsDeleteModalOpen(true);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 p-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="text-gray-600">Loading models...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            {clientId && (
                                <button
                                    onClick={() => router.back()}
                                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    Back to Client
                                </button>
                            )}
                            <h1 className="text-2xl font-semibold text-gray-900">3D Models</h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add New Model
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-500 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {models.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <CubeTransparentIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Models Found</h3>
                            <p className="text-gray-500 mb-4">Get started by adding your first 3D model.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add New Model
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {models.map((model) => (
                                <div key={model.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="aspect-square relative group">
                                        <img
                                            src={model.thumbnail
                                                ? (CDN_DOMAIN
                                                    ? `${CDN_DOMAIN}/${model.thumbnail}`
                                                    : `${BASE_URL}${model.thumbnail}.png`)
                                                : '/placeholder-model.png'}
                                            alt={model.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex gap-2">
                                                <button
                                                    onClick={() => handleViewModel(model)}
                                                    className="px-3 py-1.5 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                                                >
                                                    View Model
                                                </button>
                                                <button
                                                    onClick={(e) => openDeleteModal(model, e)}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Added {new Date(model.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Model Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Create New Model</h2>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setError('');
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

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
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    thumbnail: new File([blob], `${formData.name}-thumbnail.png`, { type: 'image/png' })
                                                                }));
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                                                    >
                                                        Set as Thumbnail
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
                                                <CubeTransparentIcon className="w-12 h-12 mb-2" />
                                                <span className="text-sm">Upload a GLB file to preview</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            'Create Model'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Model Viewer Modal */}
                {isViewerModalOpen && selectedModel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-xl font-semibold text-gray-900">{selectedModel.name}</h2>
                                <button
                                    onClick={() => setIsViewerModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="relative bg-gray-100" style={{ height: '70vh' }}>
                                <model-viewer
                                    src={CDN_DOMAIN ? `${CDN_DOMAIN}/${selectedModel.glbFile}` : `${BASE_URL}${selectedModel.glbFile}.glb`}
                                    ios-src={CDN_DOMAIN ? `${CDN_DOMAIN}/${selectedModel.usdzFile}` : `${BASE_URL}${selectedModel.usdzFile}.usdz`}
                                    poster={selectedModel.thumbnail ? (CDN_DOMAIN ? `${CDN_DOMAIN}/${selectedModel.thumbnail}` : `${BASE_URL}${selectedModel.thumbnail}.png`) : ''}
                                    alt={`3D model of ${selectedModel.name}`}
                                    auto-rotate
                                    camera-controls
                                    shadow-intensity="1"
                                    environment-image="neutral"
                                    exposure="1"
                                    style={{ width: '100%', height: '100%' }}
                                ></model-viewer>
                            </div>
                            <div className="p-4 bg-white border-t">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-gray-500">Added {new Date(selectedModel.createdAt).toLocaleDateString()}</p>
                                        <button
                                            onClick={() => openDeleteModal(selectedModel)}
                                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                                        >
                                            Delete Model
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={CDN_DOMAIN ? `${CDN_DOMAIN}/${selectedModel.glbFile}` : `${BASE_URL}${selectedModel.glbFile}.glb`}
                                            download
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Download GLB
                                        </a>
                                        <a
                                            href={CDN_DOMAIN ? `${CDN_DOMAIN}/${selectedModel.usdzFile}` : `${BASE_URL}${selectedModel.usdzFile}.usdz`}
                                            download
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Download USDZ
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && modelToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Delete Model</h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Are you sure you want to delete "{modelToDelete.name}"? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setModelToDelete(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteModel(modelToDelete.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function ModelsPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 p-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="text-gray-600">Loading models...</span>
                        </div>
                    </div>
                </div>
            </>
        }>
            <ModelsContent />
        </Suspense>
    );
} 