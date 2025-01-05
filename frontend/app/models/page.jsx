'use client';

import { useState, useEffect } from 'react';
import { menuAPI, modelAPI } from '@/services/api';
import MainLayout from '@/components/layout/MainLayout';

export default function ModelsPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMenuItems();
    }, []);

    const loadMenuItems = async () => {
        try {
            const items = await menuAPI.getMenuItems();
            setMenuItems(items);

            // Load model information for each item
            const itemsWithModels = await Promise.all(
                items.map(async (item) => {
                    try {
                        const model = await modelAPI.getModel(item.id);
                        return { ...item, model };
                    } catch {
                        return { ...item, model: null };
                    }
                })
            );

            setMenuItems(itemsWithModels);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleModelUpload = async (menuItemId, file) => {
        setIsUploading(true);
        setError(null);

        try {
            const model = await modelAPI.uploadModel(menuItemId, file);
            setMenuItems((prev) =>
                prev.map((item) =>
                    item.id === menuItemId ? { ...item, model } : item
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleModelDelete = async (menuItemId) => {
        if (!confirm('Are you sure you want to delete this model?')) return;

        try {
            await modelAPI.deleteModel(menuItemId);
            setMenuItems((prev) =>
                prev.map((item) =>
                    item.id === menuItemId ? { ...item, model: null } : item
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">3D Models Management</h2>
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menuItems.map((item) => (
                            <div
                                key={item.id}
                                className="border p-4 rounded-lg hover:border-blue-500 transition-colors"
                            >
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                <p className="text-green-600 font-medium mb-4">
                                    ${item.price.toFixed(2)}
                                </p>

                                {item.model ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                Model: {item.model.format.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {(item.model.file_size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <a
                                                href={modelAPI.getModelDownloadUrl(item.id)}
                                                className="text-blue-500 hover:text-blue-600 text-sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Download
                                            </a>
                                            <button
                                                onClick={() => handleModelDelete(item.id)}
                                                className="text-red-500 hover:text-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="relative cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg block text-center">
                                            <span>
                                                {isUploading && selectedItem === item.id
                                                    ? 'Uploading...'
                                                    : 'Upload 3D Model'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".glb,.gltf"
                                                onChange={(e) => {
                                                    setSelectedItem(item.id);
                                                    handleModelUpload(item.id, e.target.files[0]);
                                                }}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 