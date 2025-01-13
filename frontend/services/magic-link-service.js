const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.37:8000/api';
import base from './base';

export const magicLinkService = {
    validateMagicLink: async (token) => {
        const response = await fetch(`${API_BASE_URL}/magic-link/validate?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'An error occurred');
        }

        const result = await response.json();
        base.setToken(result.token);

        return result;
    }
}
