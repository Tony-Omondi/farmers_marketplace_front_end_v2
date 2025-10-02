import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddProductForm from './AddProductForm';
import AddCategoryForm from './AddCategoryForm';
import CreateOrderForm from './CreateOrderForm';
import AddUserForm from './AddUserForm';
import FarmerSales from './FarmerSales';
import EditProductForm from './EditProductForm';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        const dashboardResponse = await axios.get(`${BASE_URL}/api/adamin/dashboard/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setData(dashboardResponse.data);

        const totalRevenue = dashboardResponse.data.orders.reduce((sum, order) => {
          return sum + (parseFloat(order.total_amount) || 0);
        }, 0);

        setStats({
          totalUsers: dashboardResponse.data.users.length,
          totalProducts: dashboardResponse.data.products.length,
          totalOrders: dashboardResponse.data.orders.length,
          totalRevenue: totalRevenue
        });
      } catch (err) {
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
          (product.category?.name && product.category.name.toLowerCase().includes(query)) ||
          (product.farmer?.user && product.farmer.user.toLowerCase().includes(query))
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
    { id: 'add-user', label: 'Add User', icon: '👤' },
    { id: 'create-order', label: 'Create Order', icon: '🛒' },
    { id: 'farmer-sales', label: 'Farmer Sales', icon: '🌾' },
    { id: 'edit-product', label: 'Edit Product', icon: '✏️' }
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

    const dateFiltered = dateField ? filterDataByDate(items, dateField) : items;
    return filterDataBySearch(dateFiltered, type);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button
              className="lg:hidden absolute top-6 right-4 text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="p-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center w-full p-3 mb-2 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/adamin/login');
              }}
              className="w-full p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                className="lg:hidden p-2 text-gray-600"
                onClick={() => setIsSidebarOpen(true)}
              >
                ☰
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 animate-fadeIn"
              >
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeTab === 'users' || activeTab === 'products' || activeTab === 'orders' || activeTab === 'payments' || activeTab === 'farmer-sales') && !isLoading && (
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                  </div>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <select
                      className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
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
                          className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                        <input
                          type="date"
                          className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center h-64"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  {activeTab === 'overview' && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Overview</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                          { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                          { label: 'Total Products', value: stats.totalProducts, icon: '🛍️' },
                          { label: 'Total Orders', value: stats.totalOrders, icon: '📦' },
                          { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: '💰' },
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-gray-50 rounded-xl shadow-sm flex items-center space-x-4"
                          >
                            <span className="text-2xl">{stat.icon}</span>
                            <div>
                              <p className="text-sm text-gray-600">{stat.label}</p>
                              <p className="text-lg font-semibold text-gray-800">{stat.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3 text-gray-700">Recent Orders</h3>
                          <div className="border rounded-xl overflow-hidden">
                            {data.orders.slice(0, 5).map(order => (
                              <div key={order.order_id} className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-gray-800">#{order.order_id}</span>
                                  <span className="text-emerald-600 font-semibold">${order.total_amount}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.user.email} • {new Date(order.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                                </div>
                                <div className="text-sm mt-2">
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
                          <h3 className="text-lg font-medium mb-3 text-gray-700">New Users</h3>
                          <div className="border rounded-xl overflow-hidden">
                            {data.users.slice(0, 5).map(user => (
                              <div key={user.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                <div className="font-medium text-gray-800">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-sm mt-2">
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
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
                        <span className="text-gray-500">{getFilteredData('users').length} users</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600">
                              <th className="p-4">Full Name</th>
                              <th className="p-4">Email</th>
                              <th className="p-4">Staff</th>
                              <th className="p-4">Farmer</th>
                              <th className="p-4">Active</th>
                              <th className="p-4">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData('users').map(user => (
                              <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors">
                                <td className="p-4">{user.full_name}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.is_staff ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.is_staff ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.is_farmer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.is_farmer ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.is_active ? 'Yes' : 'No'}
                                  </span>
                                </td>
                                <td className="p-4">{new Date(user.date_joined).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'products' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
                        <span className="text-gray-500">{getFilteredData('products').length} products</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getFilteredData('products').map(product => (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative border rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white group"
                            onClick={() => navigate(`/adamin/edit-product/${product.id}`)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Edit product ${product.name}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                navigate(`/adamin/edit-product/${product.id}`);
                              }
                            }}
                          >
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Edit</span>
                            </div>
                            <div className="h-48 bg-gray-200 rounded-xl overflow-hidden mb-4">
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
                            <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center mt-3">
                              <p className="text-emerald-600 font-semibold">${product.price}</p>
                              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Category: {product.category?.name || 'None'}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Farmer: {product.farmer?.user || 'None'}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Display Only: {product.is_displayed ? 'Yes' : 'No'}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Orders</h2>
                        <span className="text-gray-500">{getFilteredData('orders').length} orders</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600">
                              <th className="p-4">Order ID</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Total</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Payment Status</th>
                              <th className="p-4">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData('orders').map(order => (
                              <tr key={order.order_id} className="border-t hover:bg-gray-50 transition-colors">
                                <td className="p-4">{order.order_id}</td>
                                <td className="p-4">{order.user.email}</td>
                                <td className="p-4">${order.total_amount}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.payment_status}
                                  </span>
                                </td>
                                <td className="p-4">{new Date(order.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'payments' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Payments</h2>
                        <span className="text-gray-500">{getFilteredData('payments').length} payments</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-100 text-gray-600">
                              <th className="p-4">Order ID</th>
                              <th className="p-4">Reference</th>
                              <th className="p-4">Amount</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredData('payments').map(order => (
                              <tr key={order.order_id} className="border-t hover:bg-gray-50 transition-colors">
                                <td className="p-4">{order.order_id}</td>
                                <td className="p-4">{order.payment.reference}</td>
                                <td className="p-4">${order.payment.amount}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    order.payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.payment.payment_status}
                                  </span>
                                </td>
                                <td className="p-4">{new Date(order.payment.created_at).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'add-product' && <AddProductForm />}
                  {activeTab === 'add-category' && <AddCategoryForm />}
                  {activeTab === 'add-user' && <AddUserForm />}
                  {activeTab === 'create-order' && <CreateOrderForm />}
                  {activeTab === 'farmer-sales' && (
                    <FarmerSales
                      filterDateRange={filterDateRange}
                      customStartDate={customStartDate}
                      customEndDate={customEndDate}
                      searchQuery={searchQuery}
                    />
                  )}
                  {activeTab === 'edit-product' && <EditProductForm />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;