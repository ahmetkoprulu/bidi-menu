'use client';

import MenuWizard from '@/app/menu/_components/MenuWizard';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateMenu() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const clientId = searchParams.get('clientId');

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Menu</h1>
                </div>
            </div>

            <MenuWizard clientId={clientId} />
        </div>
    )
} 