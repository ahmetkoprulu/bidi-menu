const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.37:8000/api';
import base from './base';

export const menuService = {
    saveMenu: async (data) => {
        const response = await fetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${base.getToken()}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    },

    getMenu: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${base.getToken()}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    },

    getClientMenus: async (clientId) => {
        const response = await fetch(`${API_BASE_URL}/menu/client/${clientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${base.getToken()}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    },

    deleteMenu: async (id) => {
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${base.getToken()}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    }
}   