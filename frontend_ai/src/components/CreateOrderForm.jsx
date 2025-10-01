import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

const CreateOrderForm = () => {
    const [carts, setCarts] = useState([]);
    const [selectedCart, setSelectedCart] = useState(null);
    const [formData, setFormData] = useState({
        cart_id: '',
        user_email: '',
        payment_mode: 'Paystack',
        coupon_code: '',
        items: [],
    });
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('carts');
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch unpaid carts and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [cartsRes, productsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/adamin/carts/`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                    }),
                    axios.get(`${BASE_URL}/api/adamin/products/`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                    }),
                ]);
                setCarts(cartsRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                console.error('Fetch Error:', err);
                setError('Failed to load carts or products');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();

        // Clear refresh query param if present
        const params = new URLSearchParams(location.search);
        if (params.get('refresh')) {
            navigate('/admin/carts', { replace: true });
        }
    }, [location, navigate]);

    // Filter carts based on search
    const filteredCarts = carts.filter(cart => 
        cart.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cart.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch cart details when a cart is selected
    const handleCartSelect = async (cartId) => {
        try {
            setError('');
            setSuccess('');
            const response = await axios.get(`${BASE_URL}/api/adamin/carts/${cartId}/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            const cart = response.data;
            setSelectedCart(cart);
            setFormData({
                cart_id: cart.uid || '',
                user_email: cart.user?.email || 'Unknown User',
                payment_mode: 'Paystack',
                coupon_code: cart.coupon?.coupon_code || '',
                items: cart.cart_items?.map(item => ({
                    id: item.id || null,
                    product_id: item.product?.id || '',
                    quantity: item.quantity || 1,
                })) || [],
            });
            setActiveTab('details');
        } catch (err) {
            console.error('Cart Fetch Error:', err);
            setError('Failed to load cart details');
        }
    };

    // Handle form input changes
    const handleChange = (e, index = null) => {
        if (index !== null) {
            const items = [...formData.items];
            items[index][e.target.name] = e.target.value;
            setFormData({ ...formData, items });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    // Add a new item to the cart
    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: '1' }],
        });
    };

    // Remove an item from the cart
    const removeItem = (index) => {
        const items = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items });
    };

    // Update cart items
    const handleUpdateCart = async () => {
        try {
            setError('');
            setSuccess('');
            await axios.put(`${BASE_URL}/api/adamin/carts/${formData.cart_id}/`, {
                items: formData.items.map(item => ({
                    product_id: item.product_id,
                    quantity: parseInt(item.quantity),
                })),
                coupon_code: formData.coupon_code,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            setSuccess('Cart updated successfully!');
            handleCartSelect(formData.cart_id);
        } catch (err) {
            console.error('Update Cart Error:', err);
            setError(err.response?.data?.message || 'Failed to update cart');
        }
    };

    // Initiate Paystack payment
    const handleInitiatePayment = async () => {
        try {
            setError('');
            setSuccess('');
            setIsLoading(true);
            const response = await axios.post(
                `${BASE_URL}/api/orders/orders/payment/initiate/`,
                { cart_id: formData.cart_id },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );
            if (response.data.status && response.data.authorization_url) {
                window.location.href = response.data.authorization_url;
            } else {
                setError(response.data.message || 'Failed to initiate payment');
            }
        } catch (err) {
            console.error('Payment Initiation Error:', err);
            setError(err.response?.data?.message || 'Payment initiation failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total with coupon discount (fallback)
    const calculateTotal = () => {
        let total = formData.items.reduce((sum, item) => {
            const product = products.find(p => p.id === parseInt(item.product_id));
            return product ? sum + parseFloat(product.price) * parseInt(item.quantity || 0) : sum;
        }, 0);
        if (selectedCart?.coupon?.discount) {
            total -= parseFloat(selectedCart.coupon.discount);
        }
        return Math.max(total, 0).toFixed(2);
    };

    // Return to cart list
    const handleBackToCarts = () => {
        setSelectedCart(null);
        setFormData({
            cart_id: '',
            user_email: '',
            payment_mode: 'Paystack',
            coupon_code: '',
            items: [],
        });
        setError('');
        setSuccess('');
        setActiveTab('carts');
    };

    // Get cart statistics
    const cartStats = {
        total: carts.length,
        withCoupons: carts.filter(cart => cart.coupon).length,
        highValue: carts.filter(cart => parseFloat(cart.total_amount) > 1000).length,
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Unpaid Carts</h1>
                        <p className="text-gray-600">Review and process customer orders efficiently</p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 lg:mt-0">
                        <div className="bg-white rounded-xl shadow-sm px-4 py-2">
                            <span className="text-sm text-gray-600">Total Carts: </span>
                            <span className="font-semibold text-emerald-600">{cartStats.total}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Carts</p>
                                <p className="text-2xl font-bold text-gray-800">{cartStats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🛒</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">With Coupons</p>
                                <p className="text-2xl font-bold text-emerald-600">{cartStats.withCoupons}</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🎫</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">High Value</p>
                                <p className="text-2xl font-bold text-purple-600">{cartStats.highValue}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">💰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('carts')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'carts'
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                🛒 All Carts ({carts.length})
                            </button>
                            {selectedCart && (
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'details'
                                            ? 'border-emerald-500 text-emerald-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    📋 Cart Details
                                </button>
                            )}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
                                    <p className="text-gray-600">Loading cart data...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                                <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-sm">{error}</p>
                                <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center">
                                <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <p className="text-sm">{success}</p>
                                <button onClick={() => setSuccess('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        )}

                        {activeTab === 'carts' && (
                            <div>
                                {/* Search and Filters */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search carts by user, email, or cart ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                </div>

                                {/* Carts Grid */}
                                {filteredCarts.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">🛒</span>
                                        </div>
                                        <p className="text-gray-500 text-lg mb-2">No carts found</p>
                                        <p className="text-gray-400 text-sm">
                                            {searchTerm ? 'No carts match your search criteria' : 'All carts have been processed'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredCarts.map(cart => (
                                            <div
                                                key={cart.uid}
                                                className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-300 hover:border-emerald-200"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-lg">🛒</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">
                                                                Cart {cart.uid.slice(0, 8)}...
                                                            </h3>
                                                            <p className="text-sm text-gray-600">{formatDate(cart.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                        {cart.cart_items?.length || 0} items
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                        </svg>
                                                        {cart.user?.full_name || cart.user?.email || 'Unknown User'}
                                                    </div>
                                                    {cart.coupon && (
                                                        <div className="flex items-center text-sm text-emerald-600">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                                                            </svg>
                                                            Coupon: {cart.coupon.coupon_code}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-2xl font-bold text-emerald-600">
                                                        KSh {parseFloat(cart.total_amount || 0).toFixed(2)}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => handleCartSelect(cart.uid)}
                                                    className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                    View Details
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'details' && selectedCart && (
                            <div>
                                {/* Cart Header */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                            Cart {selectedCart.uid}
                                        </h2>
                                        <p className="text-gray-600">
                                            Managing order for {selectedCart.user?.full_name || selectedCart.user?.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleBackToCarts}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mt-4 lg:mt-0"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                        </svg>
                                        Back to Carts
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main Form */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Customer Info */}
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>
                                                Customer Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                    <input
                                                        type="text"
                                                        value={formData.user_email}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                                                    <input
                                                        type="text"
                                                        name="coupon_code"
                                                        value={formData.coupon_code}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        placeholder="Enter coupon code"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cart Items */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                    </svg>
                                                    Cart Items ({formData.items.length})
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={addItem}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                                    </svg>
                                                    Add Item
                                                </button>
                                            </div>

                                            {formData.items.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                                    </svg>
                                                    <p>No items in this cart</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {formData.items.map((item, index) => {
                                                        const product = products.find(p => p.id === parseInt(item.product_id));
                                                        return (
                                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                                <div className="flex-1">
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Product
                                                                    </label>
                                                                    {item.id ? (
                                                                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-600">
                                                                            {product
                                                                                ? `${product.name} (KSh ${parseFloat(product.price).toFixed(2)})`
                                                                                : 'Unknown Product'}
                                                                        </div>
                                                                    ) : (
                                                                        <select
                                                                            name="product_id"
                                                                            value={item.product_id}
                                                                            onChange={e => handleChange(e, index)}
                                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                                            required
                                                                        >
                                                                            <option value="">Select Product</option>
                                                                            {products.map(product => (
                                                                                <option key={product.id} value={product.id}>
                                                                                    {product.name} (KSh {parseFloat(product.price).toFixed(2)})
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    )}
                                                                </div>
                                                                <div className="w-32">
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Quantity
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        name="quantity"
                                                                        value={item.quantity}
                                                                        onChange={e => handleChange(e, index)}
                                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                                        min="1"
                                                                        required
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(index)}
                                                                    className="mt-6 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary Panel */}
                                    <div className="space-y-6">
                                        {/* Order Summary */}
                                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal</span>
                                                    <span className="text-gray-800">KSh {calculateTotal()}</span>
                                                </div>
                                                {selectedCart.coupon?.discount && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Coupon Discount</span>
                                                        <span className="text-emerald-600">-KSh {parseFloat(selectedCart.coupon.discount).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-gray-200 pt-3">
                                                    <div className="flex justify-between text-lg font-semibold">
                                                        <span className="text-gray-800">Total</span>
                                                        <span className="text-emerald-600">
                                                            KSh {selectedCart.total_amount || calculateTotal()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                onClick={handleUpdateCart}
                                                className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                                                disabled={isLoading}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                </svg>
                                                Update Cart
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleInitiatePayment}
                                                className={`w-full py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 ${
                                                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                disabled={isLoading || formData.items.length === 0}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                                        </svg>
                                                        Pay KSh {selectedCart.total_amount || calculateTotal()}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default CreateOrderForm;