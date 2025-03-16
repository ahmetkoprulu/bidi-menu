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
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
import Category from '@/components/containers/Category';
import MenuItem from '@/components/containers/MenuItem';
import DashedButton from '@/components/buttons/DashedButton';
import { generateGuid } from '@/utils/guid';

export default function ItemsStep({ menu, setMenu }) {
    const [isImporting, setIsImporting] = useState(false);

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

    const handleExcelImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        try {
            // Read the Excel file
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Process the Excel data
            const updatedMenu = { ...menu };
            const existingCategories = [...updatedMenu.categories];

            for (const row of jsonData) {
                // Validate required fields
                if (!row.name || !row.price) {
                    console.warn('Skipping row with missing required fields:', row);
                    continue;
                }

                // Handle category
                const categoryName = row.category || 'Uncategorized';
                let category = existingCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

                // Create category if it doesn't exist
                if (!category) {
                    category = {
                        id: generateGuid(),
                        name: categoryName,
                        description: '',
                        image: '',
                        menuItems: []
                    };
                    existingCategories.push(category);
                }

                // Format price as a number
                const price = typeof row.price === 'number'
                    ? row.price
                    : parseFloat(row.price.toString().replace(/[^0-9.]/g, ''));

                // Check if item already exists in this category
                const existingItemIndex = category.menuItems.findIndex(
                    item => item.name.toLowerCase() === row.name.toLowerCase()
                );

                if (existingItemIndex >= 0) {
                    // Update existing item
                    category.menuItems[existingItemIndex] = {
                        ...category.menuItems[existingItemIndex],
                        name: row.name,
                        description: row.description || category.menuItems[existingItemIndex].description,
                        price: isNaN(price) ? category.menuItems[existingItemIndex].price : price
                    };
                } else {
                    // Create new item
                    const newItem = {
                        id: generateGuid(),
                        name: row.name,
                        description: row.description || '',
                        price: isNaN(price) ? 0 : price,
                        modelId: null
                    };
                    category.menuItems.push(newItem);
                }
            }

            // Update menu with new data
            updatedMenu.categories = existingCategories;
            setMenu(updatedMenu);

            alert(`Successfully imported ${jsonData.length} items from Excel`);
        } catch (error) {
            console.error('Error importing Excel file:', error);
            alert('Failed to import Excel file. Please check the format and try again.');
        } finally {
            setIsImporting(false);
            // Reset the file input
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 mb-1">Menu Items</h2>
                        <p className="text-sm text-gray-500">
                            Organize your menu items into categories.
                        </p>
                    </div>

                    <div className="relative">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="text-sm">
                                {isImporting ? 'Importing...' : 'Import Excel'}
                            </span>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleExcelImport}
                                disabled={isImporting}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

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