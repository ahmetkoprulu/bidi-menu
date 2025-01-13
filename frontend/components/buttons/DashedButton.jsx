'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

export default function DashedButton({ onClick, children, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed 
                border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 
                transition-colors ${className}`}
        >
            <PlusIcon className="w-5 h-5" />
            {children}
        </button>
    );
} 