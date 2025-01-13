'use client';

import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageUpload({
    value,
    onChange,
    onRemove,
    className = '',
    ...props
}) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onChange) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`w-16 ${className}`}>
            {value ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img
                        src={value}
                        alt="Uploaded image"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onRemove}
                        className="absolute top-1 right-1 p-0.5 bg-black bg-opacity-50 
                            rounded-full text-white hover:bg-opacity-70 transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center gap-1 p-2 border border-dashed 
                    border-gray-300 rounded-lg text-xs text-gray-500 cursor-pointer
                    hover:border-blue-500 hover:text-blue-500 transition-colors">
                    <PhotoIcon className="w-8 h-8" />
                    Upload
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        {...props}
                    />
                </label>
            )}
        </div>
    );
} 