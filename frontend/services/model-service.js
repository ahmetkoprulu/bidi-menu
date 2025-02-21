const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8000/api/v1';
import base from './base';

class ModelService {
    async getModels(clientId) {
        try {
            const response = await fetch(`${API_BASE_URL}/model/list?clientId=${clientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${base.getToken()}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch models');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    }

    async getModel(modelId) {
        try {
            const response = await fetch(`${API_BASE_URL}/model/${modelId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${base.getToken()}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch model');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching model:', error);
            throw error;
        }
    }

    async createModel(clientId, data) {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('glb', data.glbFile);
            formData.append('usdz', data.usdzFile);
            formData.append('thumbnail', data.thumbnail);
            formData.append('clientId', clientId);

            const response = await fetch(`${API_BASE_URL}/model`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${base.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to create model');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating model:', error);
            throw error;
        }
    }

    async deleteModel(modelId) {
        try {
            const response = await fetch(`${API_BASE_URL}/model/${modelId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${base.getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to delete model');
            }

            return true;
        } catch (error) {
            console.error('Error deleting model:', error);
            throw error;
        }
    }
}

export const modelService = new ModelService(); 