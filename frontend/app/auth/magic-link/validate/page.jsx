'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth-service';

function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <span>Validating magic link...</span>
            </div>
        </div>
    );
}

function ValidateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            try {
                const token = searchParams.get('token');
                if (!token) {
                    setError('Invalid magic link');
                    setIsLoading(false);
                    return;
                }

                await authService.validateMagicLink(token);
                router.push('/dashboard');
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        validateToken();
    }, [router, searchParams]);

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Invalid Magic Link
                        </h2>
                        <div className="mt-4 rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                        <div className="mt-4 text-center">
                            <a
                                href="/auth/magic-link"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Request a new magic link
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default function ValidateMagicLinkPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ValidateContent />
        </Suspense>
    );
} 