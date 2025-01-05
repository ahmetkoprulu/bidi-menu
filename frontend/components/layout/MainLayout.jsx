import { useState } from 'react';
import Link from 'next/link';

const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { href: '/', label: 'Dashboard', icon: '📊' },
        { href: '/menu-creator', label: 'Create Menu', icon: '📝' },
        { href: '/menu-viewer', label: 'View Menu', icon: '👀' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>
                        AR Menu
                    </h1>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isSidebarOpen ? '◀️' : '▶️'}
                    </button>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span
                                        className={`ml-3 transition-opacity duration-300 ${!isSidebarOpen && 'hidden'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
                    }`}
            >
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-lg font-semibold text-gray-900">AR Menu System</h1>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout; 