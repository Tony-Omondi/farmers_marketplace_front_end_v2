import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationProduct, setNotificationProduct] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }

        const trimmedToken = token.trim();
        if (!trimmedToken || trimmedToken === 'undefined' || trimmedToken === 'null') {
          setError('Invalid token format. Please log in again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
          return;
        }

        setIsLoading(true);

        // Fetch user data
        const userResponse = await axios.get(`${BASE_URL}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        setUser(userResponse.data);

        // Fetch products
        const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        setProducts(productsResponse.data);

        // Fetch categories
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        setCategories(categoriesResponse.data);

        // Fetch farmers
        const farmersResponse = await axios.get(`${BASE_URL}/api/adamin/farmers/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        setFarmers(farmersResponse.data);

        // Fetch cart
        const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
          headers: { Authorization: `Bearer ${trimmedToken}` },
        });
        setCart(cartResponse.data[0] || null);
      } catch (err) {
        console.error('Fetch data error:', err.response?.data, err.response?.status);
        if (err.response?.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await axios.post(`${BASE_URL}/api/accounts/token/refresh/`, {
                refresh: refreshToken.trim(),
              });
              const newAccessToken = refreshResponse.data.access;
              localStorage.setItem('access_token', newAccessToken);

              // Retry fetching
              const retryUserResponse = await axios.get(`${BASE_URL}/api/accounts/me/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              setUser(retryUserResponse.data);
              const retryProductsResponse = await axios.get(`${BASE_URL}/api/products/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              setProducts(retryProductsResponse.data);
              const retryCategoriesResponse = await axios.get(`${BASE_URL}/api/categories/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              setCategories(retryCategoriesResponse.data);
              const retryFarmersResponse = await axios.get(`${BASE_URL}/api/adamin/farmers/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              setFarmers(retryFarmersResponse.data);
              const retryCartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
                headers: { Authorization: `Bearer ${newAccessToken}` },
              });
              setCart(retryCartResponse.data[0] || null);
            } catch (refreshErr) {
              console.error('Refresh token error:', refreshErr.response?.data);
              setError('Session expired. Please log in again.');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              navigate('/login');
            }
          } else {
            setError('No refresh token available. Please log in again.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
          }
        } else if (err.response?.status === 403) {
          setError('Access forbidden. Invalid token or permissions.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Endpoint not found. Please check server configuration.');
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch data.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const addToCart = async (product) => {
    if (product.is_displayed) {
      setError('This product is for display only and cannot be added to the cart.');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${BASE_URL}/api/orders/cart-items/`,
        { product: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setNotificationProduct(product);
      setShowCartNotification(true);
      setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
    } catch (err) {
      console.error('Add to cart error:', err.response?.data);
      setError(err.response?.data?.quantity || 'Failed to add to cart.');
    }
  };

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category ? product.category.id : '',
      farmer: product.farmer ? product.farmer.id : '',
      is_displayed: product.is_displayed,
      image_files: [],
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const form = new FormData();
      form.append('name', editingProduct.name);
      form.append('description', editingProduct.description);
      form.append('price', parseFloat(editingProduct.price));
      form.append('stock', parseInt(editingProduct.stock) || 0);
      if (editingProduct.category) form.append('category', editingProduct.category);
      if (editingProduct.farmer) form.append('farmer', editingProduct.farmer);
      form.append('is_displayed', editingProduct.is_displayed);
      editingProduct.image_files.forEach(file => {
        form.append('image_files', file);
      });

      await axios.put(`${BASE_URL}/api/products/${editingProduct.id}/`, form, {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setProducts(productsResponse.data);
      setEditingProduct(null);
      setError('');
    } catch (err) {
      console.error('Edit product error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to update product.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${BASE_URL}/api/products/${productId}/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setProducts(productsResponse.data);
      setDeleteConfirm(null);
      setError('');
    } catch (err) {
      console.error('Delete product error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to delete product.');
    }
  };

  const cartCount = cart?.cart_items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const filteredProducts = products
    .filter((product) =>
      (selectedCategory === 'all' || product.category === parseInt(selectedCategory)) &&
      (searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Inter", "Noto Sans", sans-serif' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex" style={{ fontFamily: '"Inter", "Noto Sans", sans-serif' }}>
      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="Farmers Market Logo" className="h-12 w-auto transition-opacity hover:opacity-90" />
          </div>
          <div className="flex items-center mb-8 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium text-xl mr-3">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-800 truncate max-w-[150px]">{user?.full_name || 'User'}</p>
              <a href="/profile" className="text-xs text-gray-500 hover:text-emerald-600 transition-colors">View profile</a>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            <a href="/profile" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>Profile</span>
            </a>
            <a href="/orders" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Orders</span>
            </a>
            <a href="/payments" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Payments</span>
            </a>
            <a href="/cart" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute top-2 right-3 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </nav>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
              <p className="text-gray-500 mt-1">Discover fresh products from local farmers</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full transition-colors"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <a href="/cart" className="relative p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </a>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center animate-fadeIn">
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

          {editingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (KSh)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Farmer</label>
                    <select
                      value={editingProduct.farmer}
                      onChange={(e) => setEditingProduct({ ...editingProduct, farmer: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Farmer</option>
                      {farmers.map(farmer => (
                        <option key={farmer.id} value={farmer.id}>{farmer.full_name || farmer.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.is_displayed}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_displayed: e.target.checked })}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Display Only</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setEditingProduct({ ...editingProduct, image_files: Array.from(e.target.files) })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-4">Are you sure you want to delete this product?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id.toString()
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 mb-2 sm:mb-0">Fresh Products</h2>
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {searchQuery && ` for "${searchQuery}"`}
              </div>
            </div>
            <div className="p-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16M9 9h6m-6 4h6m-6 4h6"></path>
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">No products found</p>
                  <p className="text-gray-400 text-sm">
                    {searchQuery
                      ? `No products match your search for "${searchQuery}"`
                      : 'No products available in this category'}
                  </p>
                  {(searchQuery || selectedCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${product.is_displayed ? 'opacity-75' : 'hover:shadow-lg transition-all duration-300 group'}`}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0].image
                              : 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600'
                          }
                          alt={product.name}
                          className={`w-full h-48 object-cover ${product.is_displayed ? '' : 'group-hover:scale-105 transition-transform duration-300'}`}
                          onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600';
                          }}
                        />
                        <div className="absolute top-3 right-3 flex flex-col space-y-2">
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className={`p-2 rounded-full shadow-md ${wishlist.has(product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:bg-red-500 hover:text-white transition-colors`}
                            aria-label="Add to wishlist"
                          >
                            <svg className="w-4 h-4" fill={wishlist.has(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          {user?.is_staff && (
                            <>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-2 bg-white rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-colors"
                                aria-label="Edit product"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-2 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                                aria-label="Delete product"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        {!product.is_displayed && (
                          <button
                            onClick={() => addToCart(product)}
                            className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:bg-emerald-500 hover:text-white transition-colors"
                            aria-label="Add to cart"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <h3
                          className={`text-lg font-semibold text-gray-800 mb-2 line-clamp-1 ${product.is_displayed ? 'cursor-default' : 'hover:text-emerald-600 transition-colors cursor-pointer'}`}
                          onClick={() => !product.is_displayed && alert('Product details not implemented yet')}
                        >
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-emerald-600 font-bold text-lg">KSh {formatPrice(product.price)}</p>
                          {!product.is_displayed && (
                            <button
                              onClick={() => addToCart(product)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center"
                            >
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                              </svg>
                              Add
                            </button>
                          )}
                        </div>
                        {product.is_displayed && (
                          <p className="text-sm text-gray-500 mt-2">Display Only</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <button
        className={`md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md transition-all ${isOpen ? 'transform rotate-90' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <div className="md:hidden fixed top-4 right-4 z-40">
        <a href="/cart" className="relative p-2 bg-white rounded-lg shadow-md flex items-center justify-center transition-transform hover:scale-105">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </a>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity ${isOpen ? 'opacity-100 md:opacity-0' : 'opacity-0 pointer-events-none'} md:hidden`}
        onClick={toggleSidebar}
      ></div>

      {showCartNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border border-emerald-200 flex items-center animate-fadeIn">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800">Added to cart</p>
            <p className="text-sm text-gray-600">{notificationProduct?.name}</p>
          </div>
          <button onClick={() => setShowCartNotification(false)} className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;