const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.37:8000/api';

export const authService = {
    register: async (data) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    },
    login: async (data) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        return response.json();
    },

    logout() {
        localStorage.removeItem('token');
    },

    getToken() {
        console.log('getToken', document.cookie);
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    requestMagicLink: async (email) => {
        const response = await fetch(`${API_BASE_URL}/auth/magic-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send magic link');
        }

        return response.json();
    },

    validateMagicLink: async (token) => {
        const response = await fetch(`${API_BASE_URL}/auth/magic-link/validate?token=${token}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Invalid magic link');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data;
    },
    setup: async (data, token) => {
        const accessToken = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/setup?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to complete setup');
        }

        return response;
    }
}   
