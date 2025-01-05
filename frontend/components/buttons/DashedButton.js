'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

export default function DashedButton({
    onClick,
    children,
    className = '',
    icon: Icon = PlusIcon,
    ...props
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full py-2.5 border border-dashed border-gray-300 rounded
                flex items-center justify-center gap-2 text-sm text-gray-500
                hover:border-blue-500 hover:text-blue-500 transition-colors ${className}`}
            {...props}
        >
            <Icon className="w-4 h-4" />
            {children}
        </button>
    );
} 