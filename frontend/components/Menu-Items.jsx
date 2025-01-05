'use client';

import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import Section from '@/components/containers/Section';
import SortableItem from '@/components/SortableItem';
import DashedButton from '@/components/buttons/DashedButton';

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

// This would come from the previous step's template selection
const templateSections = [
    { id: 'section-1', title: "Appetizers", description: "Appetizers are small dishes served before the main course." },
    { id: 'section-2', title: "Main Course", description: "Main Course is the main dish of the meal." },
    { id: 'section-3', title: "Desserts", description: "Desserts are sweet dishes served after the main course." },
    { id: 'section-4', title: "Beverages", description: "Beverages are drinks served with the meal." }
];

export default function AddItems() {
    const [sections, setSections] = useState(templateSections);
    const [menuItems, setMenuItems] = useState({});
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddItem = (sectionId) => {
        const newItems = { ...menuItems };
        if (!newItems[sectionId]) {
            newItems[sectionId] = [];
        }
        newItems[sectionId].push({
            id: `item-${Date.now()}`,
            name: '',
            description: '',
            price: '',
            image: null
        });
        setMenuItems(newItems);
    };

    const handleSectionChanged = (id, field, value) => {
        const newSections = sections.map(section =>
            section.id === id ? { ...section, [field]: value } : section
        );
        setSections(newSections);
    };

    const handleItemChange = (sectionId, itemId, field, value) => {
        const newItems = { ...menuItems };
        const itemIndex = newItems[sectionId].findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            newItems[sectionId][itemIndex] = {
                ...newItems[sectionId][itemIndex],
                [field]: value
            };
            setMenuItems(newItems);
        }
    };

    const findItemById = (id) => {
        for (const [sectionId, items] of Object.entries(menuItems)) {
            const item = items.find(item => item.id === id);
            if (item) {
                return { item, sectionId };
            }
        }
        return null;
    };

    const findSectionById = (id) => {
        return sections.find(section => section.id === id);
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // If the item was dropped in the same location
        if (activeId === overId) return;

        const activeItem = findItemById(activeId);
        const activeSection = findSectionById(activeId);

        // Handle section reordering
        if (activeSection) {
            const oldIndex = sections.findIndex(section => section.id === activeId);
            const newIndex = sections.findIndex(section => section.id === overId);

            setSections(arrayMove(sections, oldIndex, newIndex));

            // Update menuItems to maintain the relationship
            const newMenuItems = {};
            arrayMove(sections, oldIndex, newIndex).forEach(section => {
                newMenuItems[section.id] = menuItems[section.id] || [];
            });
            setMenuItems(newMenuItems);
            return;
        }

        // Handle item reordering
        if (activeItem) {
            const { sectionId: activeSectionId } = activeItem;
            const overItem = findItemById(overId);
            const overSection = findSectionById(overId);

            // If dropping on another item
            if (overItem) {
                const { sectionId: overSectionId } = overItem;
                const oldIndex = menuItems[activeSectionId].findIndex(item => item.id === activeId);
                const newIndex = menuItems[overSectionId].findIndex(item => item.id === overId);

                const newItems = { ...menuItems };

                // If moving within the same section
                if (activeSectionId === overSectionId) {
                    newItems[activeSectionId] = arrayMove(menuItems[activeSectionId], oldIndex, newIndex);
                } else {
                    // If moving between sections
                    const [movedItem] = newItems[activeSectionId].splice(oldIndex, 1);
                    newItems[overSectionId] = [
                        ...newItems[overSectionId].slice(0, newIndex),
                        movedItem,
                        ...newItems[overSectionId].slice(newIndex)
                    ];
                }

                setMenuItems(newItems);
            }
            // If dropping on a section
            else if (overSection) {
                const oldIndex = menuItems[activeSectionId].findIndex(item => item.id === activeId);
                const newItems = { ...menuItems };
                const [movedItem] = newItems[activeSectionId].splice(oldIndex, 1);

                if (!newItems[overId]) {
                    newItems[overId] = [];
                }
                newItems[overId].push(movedItem);

                setMenuItems(newItems);
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="space-y-6 px-2">
                <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sections.map((section) => (
                        <Section
                            key={section.id}
                            id={section.id}
                            title={section.title}
                            description={section.description}
                            onTitleChange={(e) => handleSectionChanged(section.id, 'title', e.target.value)}
                            onDescriptionChange={(e) => handleSectionChanged(section.id, 'description', e.target.value)}
                            onDelete={() => {
                                setSections(sections.filter(s => s.id !== section.id));
                                const newMenuItems = { ...menuItems };
                                delete newMenuItems[section.id];
                                setMenuItems(newMenuItems);
                            }}
                            isDragging={section.id === activeId}
                        >
                            <SortableContext
                                items={(menuItems[section.id] || []).map(item => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4">
                                    {(menuItems[section.id] || []).map((item) => (
                                        <SortableItem
                                            key={item.id}
                                            id={item.id}
                                            item={item}
                                            onItemChange={(field, value) => handleItemChange(section.id, item.id, field, value)}
                                            onDelete={() => {
                                                const newItems = { ...menuItems };
                                                newItems[section.id] = newItems[section.id].filter(i => i.id !== item.id);
                                                setMenuItems(newItems);
                                            }}
                                            isDragging={item.id === activeId}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            <DashedButton onClick={() => handleAddItem(section.id)}>
                                Add Item
                            </DashedButton>
                        </Section>
                    ))}
                </SortableContext>

                <DashedButton
                    onClick={() => setSections([
                        ...sections,
                        {
                            id: `section-${Date.now()}`,
                            title: `Section ${sections.length + 1}`,
                            description: ''
                        }
                    ])}
                >
                    Add Section
                </DashedButton>
            </div>

            {typeof window !== 'undefined' && createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        findItemById(activeId) ? (
                            <SortableItem
                                id={activeId}
                                item={findItemById(activeId).item}
                                isDragging
                            />
                        ) : (
                            <Section
                                id={activeId}
                                {...findSectionById(activeId)}
                                isDragging
                            />
                        )
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
} 