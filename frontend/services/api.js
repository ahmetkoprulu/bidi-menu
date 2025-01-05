const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.28:8000/api';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
}

// Menu API calls
export const menuAPI = {
    // Upload menu image
    uploadMenu: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/menu/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to upload menu');
        }

        return response.json();
    },

    // Get all menu items
    getMenuItems: (skip = 0, limit = 100) =>
        fetchAPI(`/menu/items?skip=${skip}&limit=${limit}`),

    // Get single menu item
    getMenuItem: (id) => fetchAPI(`/menu/items/${id}`),

    // Update menu item
    updateMenuItem: (id, data) =>
        fetchAPI(`/menu/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    // Delete menu item
    deleteMenuItem: (id) =>
        fetchAPI(`/menu/items/${id}`, {
            method: 'DELETE',
        }),
};

// Model API calls
export const modelAPI = {
    // Upload model
    uploadModel: async (menuItemId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/models/upload/${menuItemId}`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to upload model');
        }

        return response.json();
    },

    // Get model info
    getModel: (menuItemId) => fetchAPI(`/models/${menuItemId}`),

    // Delete model
    deleteModel: (menuItemId) =>
        fetchAPI(`/models/${menuItemId}`, {
            method: 'DELETE',
        }),

    // Get model download URL
    getModelDownloadUrl: (menuItemId) =>
        `${API_BASE_URL}/models/${menuItemId}/download`,
}; 