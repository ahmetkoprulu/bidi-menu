'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth-service';
import { decodeJWT } from '@/lib/jwt';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            const decoded = decodeJWT(token);
            setUserRole(decoded?.roles?.[0] || null);
        }
    }, []);

    const handleLogout = () => {
        authService.logout();
        router.push('/auth/login');
    };

    const isAdmin = userRole === 'admin';
    const dashboardLink = isAdmin ? '/admin/dashboard' : '/dashboard';

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href={dashboardLink} className="text-xl font-bold text-indigo-600">
                                BiDi Menu
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href={dashboardLink}
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            {isAdmin ? (
                                <>
                                    <Link
                                        href="/admin"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Clients
                                    </Link>
                                    <Link
                                        href="/admin/menus"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        All Menus
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/menu/save"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Create Menu
                                    </Link>
                                    <Link
                                        href="/menu/templates"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                    >
                                        Templates
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
} 