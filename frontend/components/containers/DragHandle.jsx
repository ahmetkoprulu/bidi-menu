'use client';

import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export default function DragHandle({ className = '' }) {
    return (
        <EllipsisVerticalIcon
            className={`w-5 h-5 text-gray-400 hover:text-gray-600 cursor-move ${className}`}
        />
    );
} 