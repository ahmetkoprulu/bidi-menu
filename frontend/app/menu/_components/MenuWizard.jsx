'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepLayout from './StepLayout';
import GeneralStep from './wizard-steps/GeneralStep';
import ItemsStep from './wizard-steps/ItemsStep';
import CustomizationStep from './wizard-steps/CustomizationStep';
import { menuService } from '@/services/menu-service';
import { decodeJWT } from '@/lib/jwt';
import { authService } from '@/services/auth-service';

const steps = [
    { id: 'general', name: 'General', component: GeneralStep },
    { id: 'items', name: 'Items', component: ItemsStep },
    { id: 'customization', name: 'Customization', component: CustomizationStep },
];

const defaultMenu = {
    label: '',
    description: '',
    status: 'active',
    categories: [],
    customization: {
        qrCode: {
            size: 200,
            errorCorrection: 'M',
            logoSize: 40,
            logoColor: '#000000',
            qrColor: '#000000',
            backgroundColor: '#FFFFFF'
        }
    }
};

export default function MenuWizard({ id = null, clientId = null, initialData = null }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [menu, setMenu] = useState({
        ...defaultMenu,
        id: id,
        clientId: clientId,
    });

    useEffect(() => {
        if (initialData) {
            const mappedMenu = {
                ...defaultMenu,
                ...initialData,
                id: id,
                clientId: clientId,
                categories: initialData.categories?.map(category => ({
                    ...category,
                    menuItems: category.menuItems?.map(item => ({
                        ...item,
                        modelId: item.model || null,
                        model: item.modelInfo || null
                    }))
                })) || [],
                customization: {
                    ...defaultMenu.customization,
                    ...(initialData.customization || {}),
                    qrCode: {
                        ...defaultMenu.customization.qrCode,
                        ...(initialData.customization?.qrCode || {})
                    }
                }
            };
            setMenu(mappedMenu);
        }
    }, [initialData, id, clientId]);

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await menuService.saveMenu(menu);

            // Get user role from token and redirect accordingly
            const token = authService.getToken();
            const decoded = decodeJWT(token);
            const userRole = decoded?.roles?.[0];

            if (userRole === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error saving menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Steps */}
                <StepLayout steps={steps} currentStep={currentStep} />

                {/* Current Step Content */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <CurrentStepComponent
                        menu={menu}
                        setMenu={setMenu}
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {currentStep === steps.length - 1 ? (loading ? 'Saving...' : 'Save Menu') : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
} 