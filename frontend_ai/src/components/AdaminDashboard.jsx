import { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddProductForm from './AddProductForm';
import AddCategoryForm from './AddCategoryForm';
import CreateOrderForm from './CreateOrderForm';

const BASE_URL = 'https://farmers-marketplace-ez1j.onrender.com';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState({ users: [], products: [], orders: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterDateRange, setFilterDateRange] = useState('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    navigate('/adamin/login');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/api/adamin/dashboard/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log('Dashboard data:', response.data);
                setData(response.data);
                
                // Calculate statistics
                const totalRevenue = response.data.orders.reduce((sum, order) => {
                    return sum + (parseFloat(order.total_amount) || 0);
                }, 0);
                
                setStats({
                    totalUsers: response.data.users.length,
                    totalProducts: response.data.products.length,
                    totalOrders: response.data.orders.length,
                    totalRevenue: totalRevenue
                });
            } catch (err) {
                console.error('Dashboard error:', err.response?.data);
                setError(err.response?.data?.detail || 'Failed to load dashboard data');
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/adamin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    // Filter data based on date range
    const filterDataByDate = (items, dateField = 'created_at') => {
        if (filterDateRange === 'all') return items;
        
        const now = new Date();
        let startDate;
        
        switch(filterDateRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'yesterday':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                const yesterdayEnd = new Date(startDate);
                yesterdayEnd.setHours(23, 59, 59, 999);
                return items.filter(item => {
                    const itemDate = new Date(item[dateField]);
                    return itemDate >= startDate && itemDate <= yesterdayEnd;
                });
            case 'last7':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'last30':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case 'custom':
                if (!customStartDate || !customEndDate) return items;
                startDate = new Date(customStartDate);
                const endDate = new Date(customEndDate);
                endDate.setHours(23, 59, 59, 999);
                return items.filter(item => {
                    const itemDate = new Date(item[dateField]);
                    return itemDate >= startDate && itemDate <= endDate;
                });
            default:
                return items;
        }
        
        return items.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= startDate;
        });
    };

    // Filter data based on search query
    const filterDataBySearch = (items, type) => {
        if (!searchQuery) return items;
        
        const query = searchQuery.toLowerCase();
        
        switch(type) {
            case 'users':
                return items.filter(user => 
                    user.full_name.toLowerCase().includes(query) || 
                    user.email.toLowerCase().includes(query)
                );
            case 'products':
                return items.filter(product => 
                    product.name.toLowerCase().includes(query) || 
                    product.description.toLowerCase().includes(query) ||
                    (product.category?.name && product.category.name.toLowerCase().includes(query))
                );
            case 'orders':
                return items.filter(order => 
                    order.order_id.toLowerCase().includes(query) || 
                    order.user.email.toLowerCase().includes(query) ||
                    order.status.toLowerCase().includes(query) ||
                    String(order.total_amount).includes(query) ||
                    order.payment_status.toLowerCase().includes(query)
                );
            case 'payments':
                return items.filter(order => 
                    order.payment && (
                        order.payment.reference?.toLowerCase().includes(query) ||
                        String(order.payment.amount).includes(query) ||
                        order.payment.payment_status.toLowerCase().includes(query) ||
                        order.order_id.toLowerCase().includes(query)
                    )
                );
            default:
                return items;
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'products', label: 'Products', icon: '🛍️' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'payments', label: 'Payments', icon: '💳' },
        { id: 'add-product', label: 'Add Product', icon: '➕' },
        { id: 'add-category', label: 'Add Category', icon: '📂' },
        { id: 'create-order', label: 'Create Order', icon: '🛒' },
    ];

    const getFilteredData = (type) => {
        let items = [];
        let dateField = 'created_at';
        switch(type) {
            case 'users':
                items = data.users;
                dateField = 'date_joined';
                break;
            case 'products':
            case 'orders':
                items = data[type];
                break;
            case 'payments':
                items = data.orders.filter(order => order.payment && order.payment.reference);
                break;
            default:
                return [];
        }
        
        const dateFiltered = filterDataByDate(items, dateField);
        return filterDataBySearch(dateFiltered, type);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            navigate('/adamin/login');
                        }}
                        className="mt-2 md:mt-0 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Logout
                    </button>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        <p>{error}</p>
                    </div>
                )}
                
                {/* Stats Overview */}
                {activeTab === 'overview' && !isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Users</p>
                                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg mr-4">
                                    <span className="text-2xl">🛍️</span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Products</p>
                                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Orders</p>
                                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Revenue</p>
                                    <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Filters */}
                {(activeTab === 'users' || activeTab === 'products' || activeTab === 'orders' || activeTab === 'payments') && !isLoading && (
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                <select
                                    className="p-2 border border-gray-300 rounded-lg"
                                    value={filterDateRange}
                                    onChange={(e) => setFilterDateRange(e.target.value)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="last7">Last 7 Days</option>
                                    <option value="last30">Last 30 Days</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                                
                                {filterDateRange === 'custom' && (
                                    <div className="flex space-x-2">
                                        <input
                                            type="date"
                                            className="p-2 border border-gray-300 rounded-lg"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            className="p-2 border border-gray-300 rounded-lg"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex overflow-x-auto space-x-4 border-b">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`flex items-center py-2 px-4 text-sm font-medium whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-emerald-600 text-emerald-600'
                                        : 'text-gray-600 hover:text-emerald-600'
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
                    </div>
                ) : (
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                        {activeTab === 'overview' && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Recent Orders</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            {data.orders.slice(0, 5).map(order => (
                                                <div key={order.order_id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">#{order.order_id}</span>
                                                        <span className="text-emerald-600">${order.total_amount}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.user.email} • {new Date(order.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                                                    </div>
                                                    <div className="text-sm mt-1">
                                                        Status: <span className={`px-2 py-1 rounded-full text-xs ${
                                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>{order.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-3">New Users</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            {data.users.slice(0, 5).map(user => (
                                                <div key={user.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                                    <div className="font-medium">{user.full_name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                    <div className="text-sm mt-1">
                                                        Joined: {new Date(user.date_joined).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'users' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Users</h2>
                                    <span className="text-gray-500">{getFilteredData('users').length} users</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600">
                                                <th className="p-3">Full Name</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Staff</th>
                                                <th className="p-3">Active</th>
                                                <th className="p-3">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredData('users').map(user => (
                                                <tr key={user.id} className="border-t hover:bg-gray-50">
                                                    <td className="p-3">{user.full_name}</td>
                                                    <td className="p-3">{user.email}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            user.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {user.is_staff ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {user.is_active ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{new Date(user.date_joined).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'products' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Products</h2>
                                    <span className="text-gray-500">{getFilteredData('products').length} products</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {getFilteredData('products').map(product => (
                                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="h-48 bg-gray-200 rounded-lg overflow-hidden mb-3">
                                                {product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-medium">{product.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                                            <div className="flex justify-between items-center mt-3">
                                                <p className="text-emerald-600 font-semibold">${product.price}</p>
                                                <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-500">
                                                Category: {product.category?.name || 'None'}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Created: {new Date(product.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'orders' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Orders</h2>
                                    <span className="text-gray-500">{getFilteredData('orders').length} orders</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600">
                                                <th className="p-3">Order ID</th>
                                                <th className="p-3">User</th>
                                                <th className="p-3">Total</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Payment Status</th>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredData('orders').map(order => (
                                                <tr key={order.order_id} className="border-t hover:bg-gray-50">
                                                    <td className="p-3 font-medium">#{order.order_id}</td>
                                                    <td className="p-3">{order.user.email}</td>
                                                    <td className="p-3">${order.total_amount}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{new Date(order.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                                                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'payments' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Payments</h2>
                                    <span className="text-gray-500">
                                        {getFilteredData('payments').length} payments
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600">
                                                <th className="p-3">Reference</th>
                                                <th className="p-3">Order ID</th>
                                                <th className="p-3">Amount</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredData('payments').map(order => (
                                                <tr key={order.payment.reference} className="border-t hover:bg-gray-50">
                                                    <td className="p-3">{order.payment.reference || 'N/A'}</td>
                                                    <td className="p-3">#{order.order_id}</td>
                                                    <td className="p-3">${order.payment.amount}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            order.payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {order.payment.payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">{new Date(order.payment.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                                                </tr>
                                            ))}
                                            {data.orders.filter(order => !order.payment || !order.payment.reference).length > 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-3 text-gray-500 text-center">
                                                        Some orders (e.g., cash payments) have no payment record.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'add-product' && <AddProductForm />}
                        {activeTab === 'add-category' && <AddCategoryForm />}
                        {activeTab === 'create-order' && <CreateOrderForm />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;