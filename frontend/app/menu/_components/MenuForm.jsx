'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function MenuForm({ id = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [menu, setMenu] = useState({
        id: id,
        label: '',
        description: '',
        status: 'active',
        categories: [],
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchMenu(id);
        }
    }, [id]);

    const fetchMenu = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/menus/${id}`);
            if (!response.ok) throw new Error('Failed to fetch menu');
            const data = await response.json();
            setMenu({
                ...data,
                id: id
            });
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = menu.id ? `/api/menus/${menu.id}` : '/api/menus';
            const method = menu.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menu),
            });

            if (!response.ok) throw new Error('Failed to save menu');

            const savedMenu = await response.json();
            router.push('/dashboard');
        } catch (error) {
            console.error('Error saving menu:', error);
        } finally {
            setLoading(false);
        }
    };

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
            id: `category-${Date.now()}`,
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
            id: `item-${Date.now()}`,
            name: '',
            description: '',
            price: 0,
            image: ''
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

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

                <DashedButton onClick={addCategory} className="w-full">
                    Add Section
                </DashedButton>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Menu'}
                    </button>
                </div>
            </form>
        </div>
    );
} 