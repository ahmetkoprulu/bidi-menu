'use client';

export default function CustomizationStep({ menu, setMenu }) {
    const handleQrStyleChange = (key, value) => {
        setMenu(prev => ({
            ...prev,
            customization: {
                ...prev.customization,
                qrCode: {
                    ...prev.customization.qrCode,
                    [key]: value
                }
            }
        }));
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">QR Code Style</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Customize how your menu QR code looks.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size
                        </label>
                        <select
                            value={menu.customization.qrCode?.size || 200}
                            onChange={(e) => handleQrStyleChange('size', parseInt(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="150">Small (150px)</option>
                            <option value="200">Medium (200px)</option>
                            <option value="250">Large (250px)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Error Correction
                        </label>
                        <select
                            value={menu.customization.qrCode?.errorCorrection || 'M'}
                            onChange={(e) => handleQrStyleChange('errorCorrection', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="L">Low</option>
                            <option value="M">Medium</option>
                            <option value="Q">High</option>
                            <option value="H">Very High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo Size
                        </label>
                        <select
                            value={menu.customization.qrCode?.logoSize || 40}
                            onChange={(e) => handleQrStyleChange('logoSize', parseInt(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="30">Small (30px)</option>
                            <option value="40">Medium (40px)</option>
                            <option value="50">Large (50px)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo Color
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={menu.customization.qrCode?.logoColor || '#000000'}
                                onChange={(e) => handleQrStyleChange('logoColor', e.target.value)}
                                className="h-10 w-20 p-1 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                value={menu.customization.qrCode?.logoColor || '#000000'}
                                onChange={(e) => handleQrStyleChange('logoColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            QR Code Color
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={menu.customization.qrCode?.qrColor || '#000000'}
                                onChange={(e) => handleQrStyleChange('qrColor', e.target.value)}
                                className="h-10 w-20 p-1 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                value={menu.customization.qrCode?.qrColor || '#000000'}
                                onChange={(e) => handleQrStyleChange('qrColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={menu.customization.qrCode?.backgroundColor || '#FFFFFF'}
                                onChange={(e) => handleQrStyleChange('backgroundColor', e.target.value)}
                                className="h-10 w-20 p-1 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                value={menu.customization.qrCode?.backgroundColor || '#FFFFFF'}
                                onChange={(e) => handleQrStyleChange('backgroundColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 