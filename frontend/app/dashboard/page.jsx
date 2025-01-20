'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, QrCodeIcon, CubeIcon } from '@heroicons/react/24/outline';
import DashboardService from '@/services/dashboard-service';
import { decodeJWT } from '@/lib/jwt';
import { authService } from '@/services/auth-service';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalMenus: 0,
        activeMenus: 0,
        totalViews: 0
    });
    const [recentMenus, setRecentMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        // Get user role from token
        const token = authService.getToken();
        if (token) {
            const decoded = decodeJWT(token);
            setUserRole(decoded?.roles?.[0] || null);
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getDashboardData();
                setStats(data.stats);
                setRecentMenus(data.recentMenus);
                setError(null);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getEditLink = (menuId) => {
        return userRole === 'admin' ? `/admin/menu/${menuId}` : `/menu/save/${menuId}`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome to your BiDi Menu dashboard</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 text-sm font-medium">Total Menus</h3>
                            <CubeIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalMenus}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 text-sm font-medium">Active Menus</h3>
                            <QrCodeIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeMenus}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 text-sm font-medium">Total Views</h3>
                            <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalViews}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/menu/save" className="flex items-center p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors">
                            <PlusIcon className="h-6 w-6 text-blue-500 mr-3" />
                            <div>
                                <h3 className="font-medium text-gray-900">Create New Menu</h3>
                                <p className="text-sm text-gray-500">Add a new 3D menu to your collection</p>
                            </div>
                        </Link>
                        <Link href="/menu/templates" className="flex items-center p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors">
                            <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            <div>
                                <h3 className="font-medium text-gray-900">Browse Templates</h3>
                                <p className="text-sm text-gray-500">Start with pre-made menu templates</p>
                            </div>
                        </Link>
                        <Link href="/settings" className="flex items-center p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-500 transition-colors">
                            <svg className="h-6 w-6 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                                <h3 className="font-medium text-gray-900">Settings</h3>
                                <p className="text-sm text-gray-500">Manage your account settings</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Menus */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Menus</h2>
                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                        {recentMenus.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {recentMenus.map((menu) => (
                                    <div key={menu.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <Link
                                            href={`/menu/view/${menu.id}`}
                                            className="flex items-center flex-1"
                                        >
                                            <div className="flex items-center">
                                                <CubeIcon className="h-8 w-8 text-gray-400 mr-3" />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{menu.label}</h3>
                                                    <p className="text-sm text-gray-500">Last updated: {new Date(menu.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-500">{menu.views} views</span>
                                            <Link
                                                href={getEditLink(menu.id)}
                                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                                title="Edit menu"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={`/menu/view/${menu.id}`}
                                                className="text-gray-400 hover:text-gray-500 transition-colors"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No menus yet</h3>
                                <p className="text-gray-500 mb-4">Create your first 3D menu to get started</p>
                                <Link
                                    href="/menu/save"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Create Menu
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}