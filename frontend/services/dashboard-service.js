'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://192.168.1.37:8000/api';
import base from './base';

class DashboardService {
    static async getDashboardData() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${base.getToken()}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }
}

export default DashboardService;
