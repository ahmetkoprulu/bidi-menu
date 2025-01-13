'use client';

export default function CustomizationStep({ menu, setMenu }) {
    const handleColorChange = (key, value) => {
        setMenu(prev => ({
            ...prev,
            customization: {
                ...prev.customization,
                colors: {
                    ...prev.customization.colors,
                    [key]: value
                }
            }
        }));
    };

    const handleFontChange = (key, value) => {
        setMenu(prev => ({
            ...prev,
            customization: {
                ...prev.customization,
                font: {
                    ...prev.customization.font,
                    [key]: value
                }
            }
        }));
    };

    const handleStyleChange = (value) => {
        setMenu(prev => ({
            ...prev,
            customization: {
                ...prev.customization,
                itemStyle: value
            }
        }));
    };

    return (
        <div className="space-y-8">
            {/* Colors */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Colors</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Customize the colors of your menu.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(menu.customization.colors).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="h-10 w-20 p-1 rounded border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fonts */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Typography</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Choose fonts and spacing for your menu.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Heading Font
                        </label>
                        <select
                            value={menu.customization.font.heading}
                            onChange={(e) => handleFontChange('heading', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Body Font
                        </label>
                        <select
                            value={menu.customization.font.body}
                            onChange={(e) => handleFontChange('body', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Line Spacing
                        </label>
                        <input
                            type="number"
                            value={menu.customization.font.spacing}
                            onChange={(e) => handleFontChange('spacing', parseFloat(e.target.value))}
                            min="0.5"
                            max="2"
                            step="0.1"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Layout */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Layout</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Choose how your menu items are displayed.
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Style
                        </label>
                        <select
                            value={menu.customization.itemStyle}
                            onChange={(e) => handleStyleChange(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                            <option value="compact">Compact</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
} 