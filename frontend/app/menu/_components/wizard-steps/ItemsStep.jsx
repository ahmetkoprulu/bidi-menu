'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Category from '@/components/containers/Category';
import MenuItem from '@/components/containers/MenuItem';
import DashedButton from '@/components/buttons/DashedButton';
import { generateGuid } from '@/utils/guid';

export default function ItemsStep({ menu, setMenu }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCategoryDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setMenu((menu) => {
                const oldIndex = menu.categories.findIndex((cat) => cat.id === active.id);
                const newIndex = menu.categories.findIndex((cat) => cat.id === over.id);
                return {
                    ...menu,
                    categories: arrayMove(menu.categories, oldIndex, newIndex),
                };
            });
        }
    };

    const handleItemDragEnd = (event, categoryId) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setMenu((menu) => {
                const category = menu.categories.find((cat) => cat.id === categoryId);
                const items = category.menuItems;
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newCategories = menu.categories.map((cat) => {
                    if (cat.id === categoryId) {
                        return {
                            ...cat,
                            menuItems: arrayMove(items, oldIndex, newIndex),
                        };
                    }
                    return cat;
                });

                return {
                    ...menu,
                    categories: newCategories,
                };
            });
        }
    };

    const addCategory = () => {
        const newCategory = {
            id: generateGuid(),
            name: '',
            description: '',
            image: '',
            menuItems: []
        };

        setMenu(prev => ({
            ...prev,
            categories: [...prev.categories, newCategory]
        }));
    };

    const addItem = (categoryId) => {
        const newItem = {
            id: generateGuid(),
            name: '',
            description: '',
            price: 0,
            modelId: null
        };

        setMenu(prev => ({
            ...prev,
            categories: prev.categories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        menuItems: [...category.menuItems, newItem]
                    };
                }
                return category;
            })
        }));
    };

    const handleCategoryChange = (categoryId, field, value) => {
        setMenu(prev => ({
            ...prev,
            categories: prev.categories.map(category => {
                if (category.id === categoryId) {
                    return { ...category, [field]: value };
                }
                return category;
            })
        }));
    };

    const handleItemChange = (categoryId, itemId, field, value) => {
        setMenu(prev => ({
            ...prev,
            categories: prev.categories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        menuItems: category.menuItems.map(item => {
                            if (item.id === itemId) {
                                return { ...item, [field]: value };
                            }
                            return item;
                        })
                    };
                }
                return category;
            })
        }));
    };

    const removeCategory = (categoryId) => {
        setMenu(prev => ({
            ...prev,
            categories: prev.categories.filter(category => category.id !== categoryId)
        }));
    };

    const removeItem = (categoryId, itemId) => {
        setMenu(prev => ({
            ...prev,
            categories: prev.categories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        menuItems: category.menuItems.filter(item => item.id !== itemId)
                    };
                }
                return category;
            })
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">Menu Items</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Organize your menu items into categories.
                </p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleCategoryDragEnd}
                >
                    <SortableContext
                        items={menu.categories.map(cat => cat.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {menu.categories.map((category) => (
                                <Category
                                    key={category.id}
                                    id={category.id}
                                    title={category.name}
                                    description={category.description}
                                    image={category.image}
                                    onTitleChange={(e) => handleCategoryChange(category.id, 'name', e.target.value)}
                                    onDescriptionChange={(e) => handleCategoryChange(category.id, 'description', e.target.value)}
                                    onDelete={() => removeCategory(category.id)}
                                >
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={(event) => handleItemDragEnd(event, category.id)}
                                    >
                                        <SortableContext
                                            items={category.menuItems.map(item => item.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="space-y-2">
                                                {category.menuItems.map((item) => (
                                                    <MenuItem
                                                        key={item.id}
                                                        id={item.id}
                                                        item={item}
                                                        clientId={menu.clientId}
                                                        onItemChange={(field, value) => handleItemChange(category.id, item.id, field, value)}
                                                        onDelete={() => removeItem(category.id, item.id)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                    <DashedButton
                                        onClick={() => addItem(category.id)}
                                        className="w-full mt-2"
                                    >
                                        Add Item
                                    </DashedButton>
                                </Category>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <DashedButton onClick={addCategory} className="w-full mt-4">
                    Add Section
                </DashedButton>
            </div>
        </div>
    );
} 