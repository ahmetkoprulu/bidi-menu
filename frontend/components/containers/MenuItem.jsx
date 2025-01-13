'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/outline';
import ModelSelect from '@/components/inputs/ModelSelect';
import TextField from '@/components/inputs/TextField';
import TextArea from '@/components/inputs/TextArea';

export default function MenuItem({ id, item, clientId, onItemChange, onDelete }) {
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
    };

    const handleModelChange = (model) => {
        // Update both modelId and modelInfo fields
        onItemChange('modelId', model?.id || null);
        onItemChange('modelInfo', model || null);
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
                <div {...attributes} {...listeners} className="cursor-move mt-1">
                    <Bars3Icon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 space-y-4">
                    <div className='w-full flex flex-row gap-4'>
                        <TextField
                            value={item.name}
                            onChange={(e) => onItemChange('name', e.target.value)}
                            placeholder="Item name"
                            textSize="m"
                            className="w-full"
                        />

                        <TextField
                            value={item.price}
                            onChange={(e) => onItemChange('price', parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            textSize="m"
                            type="number"
                            className="w-1/6"
                        />
                    </div>
                    <TextArea
                        value={item.description}
                        onChange={(e) => onItemChange('description', e.target.value)}
                        placeholder="Item description"
                    />
                </div>
                <ModelSelect
                    value={item.modelId}
                    selectedModel={item.modelInfo}
                    onChange={handleModelChange}
                    clientId={clientId}
                    className="my-auto"
                />
                <button
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
} 