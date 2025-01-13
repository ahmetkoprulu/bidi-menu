const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.37:8000/api';
import base from './base';

export const adminService = {
    login: async (data) => {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
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

        const result = await response.json();
        base.setToken(result.token);
        return result;
    },

    logout() {
        base.removeToken();
    },

    isAuthenticated() {
        return !!base.getToken();
    },

    getClients: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/clients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${base.getToken()}`
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    },

    initClient: async (data) => {
        const response = await fetch(`${API_BASE_URL}/clients/init`, {
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
}   