'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@heroicons/react/24/outline';
import DragHandle from '@/components/containers/DragHandle';
import TextField from '@/components/inputs/TextField';
import TextArea from '@/components/inputs/TextArea';
import ImageUpload from '@/components/inputs/ImageUpload';

export default function Category({
    id,
    title,
    image,
    description,
    onTitleChange,
    onDescriptionChange,
    onDelete,
    children,
    className = '',
    isDragging = false,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 rounded-lg border border-gray-200 ${className}`}
        >
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-4">
                <div {...attributes} {...listeners}>
                    <DragHandle />
                </div>
                <div className='flex-1 space-y-3'>
                    <TextField
                        value={title}
                        onChange={onTitleChange}
                        placeholder="Section name"
                        textSize="lg"
                        textWeight="semibold"
                        className=""
                    />
                    <TextArea
                        value={description}
                        onChange={onDescriptionChange}
                        placeholder="Section description"
                    />
                </div>
                <button
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Section Content */}
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
} 