'use client';
import React from 'react';
import { adminService } from '@/services/admin-service';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Dropdown from '@/components/dropdowns/Dropdown';
import { menuService } from '@/services/menu-service';

export default function AdminPage() {
    const router = useRouter();
    const [clients, setClients] = useState([]);
    const [expandedClient, setExpandedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        phone: ''
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await adminService.getClients();
            setClients(data.clients || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleAccordion = (clientId) => {
        setExpandedClient(expandedClient === clientId ? null : clientId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        try {
            await adminService.initClient(formData);
            setIsModalOpen(false);
            setFormData({
                name: '',
                email: '',
                companyName: '',
                phone: ''
            });
            fetchClients(); // Refresh the client list
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleCreateMenu = (clientId) => {
        router.push(`/menu/save?clientId=${clientId}`);
    };

    const handleEditMenu = (menuId, clientId) => {
        router.push(`/menu/save/${menuId}?clientId=${clientId}`);
    };

    const handleDeleteMenu = async (menuId) => {
        if (window.confirm('Are you sure you want to delete this menu?')) {
            try {
                await menuService.deleteMenu(menuId);
                fetchClients(); // Refresh the client list to get updated menus
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleEditClient = (clientId) => {
        // TODO: Implement edit client functionality
        console.log('Edit client:', clientId);
    };

    const handleDeleteClient = async (clientId) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await adminService.deleteClient(clientId);
                fetchClients(); // Refresh the list
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Create Client
                    </button>
                </div>

                <div className="bg-white shadow-md rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="w-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.map((client) => (
                                    <React.Fragment key={client.id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => toggleAccordion(client.id)}
                                                    className="text-gray-400 hover:text-gray-600 flex items-center"
                                                >
                                                    {expandedClient === client.id ? (
                                                        <ChevronUpIcon className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{client.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {client.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                                                <Dropdown
                                                    trigger={
                                                        <button
                                                            className="text-gray-400 hover:text-gray-600 flex items-center"
                                                            aria-label="Open actions menu"
                                                        >
                                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                                        </button>
                                                    }
                                                    items={[
                                                        {
                                                            label: 'Create Menu',
                                                            onClick: () => handleCreateMenu(client.id),
                                                        },
                                                        {
                                                            label: 'Edit Client',
                                                            onClick: () => handleEditClient(client.id),
                                                        },
                                                        {
                                                            label: 'Delete',
                                                            onClick: () => handleDeleteClient(client.id),
                                                            className: 'text-red-600 hover:bg-gray-100',
                                                        },
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                        {expandedClient === client.id && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                                    <div className="space-y-4">
                                                        {client.menus?.length > 0 ? (
                                                            client.menus.map((menu) => (
                                                                <div key={menu.id} className="bg-white p-4 rounded-lg shadow">
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <h3 className="text-lg font-medium text-gray-900">{menu.label}</h3>
                                                                        <div className="flex items-center space-x-4">
                                                                            <span className="text-sm text-gray-500">Created: {new Date(menu.createdAt).toLocaleDateString()}</span>
                                                                            <Dropdown
                                                                                trigger={
                                                                                    <button
                                                                                        className="text-gray-400 hover:text-gray-600"
                                                                                        aria-label="Menu actions"
                                                                                    >
                                                                                        <EllipsisVerticalIcon className="h-5 w-5" />
                                                                                    </button>
                                                                                }
                                                                                items={[
                                                                                    {
                                                                                        label: 'Edit Menu',
                                                                                        onClick: () => handleEditMenu(menu.id, client.id),
                                                                                    },
                                                                                    {
                                                                                        label: 'Delete Menu',
                                                                                        onClick: () => handleDeleteMenu(menu.id),
                                                                                        className: 'text-red-600 hover:bg-gray-100',
                                                                                    },
                                                                                ]}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {menu.categories?.length > 0 ? (
                                                                        menu.categories.map((category) => (
                                                                            <div key={category.id} className="mt-4">
                                                                                <h4 className="text-md font-medium text-gray-800 mb-2">{category.name}</h4>
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                                    {category.menuItems?.map((item) => (
                                                                                        <div key={item.id} className="border rounded p-3">
                                                                                            <div className="flex justify-between items-start">
                                                                                                <div>
                                                                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                                                                    <p className="text-sm text-gray-500">{item.description}</p>
                                                                                                </div>
                                                                                                <p className="text-green-600 font-medium">${item.price}</p>
                                                                                            </div>
                                                                                            {item.model && (
                                                                                                <div className="mt-2">
                                                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                                        3D Model Available
                                                                                                    </span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-gray-500">No categories available</p>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <p className="text-gray-500">No menus available</p>
                                                                <button
                                                                    onClick={() => handleCreateMenu(client.id)}
                                                                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                >
                                                                    Create Menu
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Create New Client</h2>
                        {formError && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                <p>{formError}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}