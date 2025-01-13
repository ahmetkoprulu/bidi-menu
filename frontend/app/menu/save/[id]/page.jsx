'use client';

import { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuWizard from '../../_components/MenuWizard';
import { menuService } from '@/services/menu-service';

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

function MenuContent({ params }) {
    const { id } = use(params);
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const data = await menuService.getMenu(id);
                setMenu(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [id]);

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error loading menu: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <SearchParamsWrapper>
                {(clientId) => <MenuWizard id={id} clientId={clientId} initialData={menu} />}
            </SearchParamsWrapper>
        </Suspense>
    );
}

export default function EditMenu({ params }) {
    return (
        <Suspense fallback={<LoadingState />}>
            <MenuContent params={params} />
        </Suspense>
    );
} 