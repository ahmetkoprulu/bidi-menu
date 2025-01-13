'use client';

import { Suspense } from 'react';
import MenuWizard from '@/app/menu/_components/MenuWizard';
import { useRouter, useSearchParams } from 'next/navigation';

function LoadingState() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
}

function SearchParamsWrapper({ children }) {
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');
    return children(clientId);
}

function MenuContent() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Menu</h1>
                </div>
            </div>

            <SearchParamsWrapper>
                {(clientId) => <MenuWizard clientId={clientId} />}
            </SearchParamsWrapper>
        </div>
    );
}

export default function CreateMenu() {
    return (
        <Suspense fallback={<LoadingState />}>
            <MenuContent />
        </Suspense>
    );
} 