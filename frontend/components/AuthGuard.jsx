'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth-service';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status
        const checkAuth = () => {
            if (!authService.isAuthenticated()) {
                router.push('/auth/login');
            } else {
                setIsAuthenticated(true);
            }
        };

        checkAuth();
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
} 