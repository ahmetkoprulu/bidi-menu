'use client';

import TextField from '@/components/inputs/TextField';
import TextArea from '@/components/inputs/TextArea';

export default function GeneralStep({ menu, setMenu }) {
    const handleChange = (field, value) => {
        setMenu(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Menu Information</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Basic information about your menu.
                </p>

                <div className="space-y-4">
                    <div>
                        <TextField
                            label="Menu Name"
                            value={menu.label}
                            onChange={(e) => handleChange('label', e.target.value)}
                            placeholder="e.g., Lunch Menu, Dinner Specials"
                            required
                        />
                    </div>

                    <div>
                        <TextArea
                            label="Description"
                            value={menu.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe your menu..."
                            rows={4}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={menu.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
} 