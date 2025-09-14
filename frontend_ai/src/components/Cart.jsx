import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-ez1j.onrender.com';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to view your cart.');
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        console.log('Cart data:', cartResponse.data);
        const cartData = cartResponse.data[0] || null;
        setCart(cartData);

        // Fetch product details if cart_items contain product IDs
        if (cartData && cartData.cart_items) {
          const productIds = cartData.cart_items
            .filter((item) => typeof item.product === 'number')
            .map((item) => item.product);
          if (productIds.length > 0) {
            const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
              headers: { Authorization: `Bearer ${token.trim()}` },
              params: { ids: productIds.join(',') },
            });
            const productMap = productsResponse.data.reduce((map, product) => {
              map[product.id] = product;
              return map;
            }, {});
            console.log('Fetched products:', productMap);
            setProducts(productMap);
          }
        }
      } catch (err) {
        console.error('Fetch cart error:', err.response?.data);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        } else {
          setError(err.response?.data?.detail || 'Failed to fetch cart.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${BASE_URL}/api/orders/cart-items/${itemId}/`,
        { quantity },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setSuccessMessage('Cart updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update quantity error:', err.response?.data);
      setError(err.response?.data?.quantity || 'Failed to update quantity.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${BASE_URL}/api/orders/cart-items/${itemId}/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setSuccessMessage('Item removed from cart');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Remove item error:', err.response?.data);
      setError('Failed to remove item.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${BASE_URL}/api/orders/carts/apply-coupon/`,
        { coupon: couponCode.trim() },
        { headers: { Authorization: `Bearer ${token.trim()}` } }
      );
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      setCart(cartResponse.data[0] || null);
      setCouponCode('');
      setError('');
      setSuccessMessage('Coupon applied successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Apply coupon error:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to apply coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const getTotalAmount = () => {
    if (cart?.total_amount) return parseFloat(cart.total_amount);
    if (!cart?.cart_items) return 0;
    return cart.cart_items.reduce((total, item) => {
      const product = typeof item.product === 'object' ? item.product : products[item.product];
      return total + (product ? parseFloat(product.price) * item.quantity : 0);
    }, 0);
  };

  const getItemTotal = (item) => {
    const product = typeof item.product === 'object' ? item.product : products[item.product];
    return product ? parseFloat(product.price) * item.quantity : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <main className="flex-1 max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Continue Shopping
          </button>
        </div>

        {/* Messages */}
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

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center">
            <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-sm">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              {/* Cart Items */}
              <div className="space-y-6">
                {cart.cart_items.map((item) => {
                  const product = typeof item.product === 'object' ? item.product : products[item.product];
                  const isUpdating = updatingItems[item.id];
                  
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={
                          product?.images && product.images.length > 0
                            ? product.images[0].image
                            : 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600'
                        }
                        alt={product?.name || 'Product'}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/5705490/pexels-photo-5705490.jpeg?auto=compress&cs=tinysrgb&w=600';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{product?.name || 'Unknown Product'}</h3>
                        <p className="text-emerald-600 font-medium">KSh {formatPrice(product?.price || 0)}</p>
                        <p className="text-sm text-gray-600">Item total: KSh {formatPrice(getItemTotal(item))}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            disabled={isUpdating}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          disabled={isUpdating}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section */}
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Apply Coupon</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isApplyingCoupon ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'Apply Coupon'
                    )}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">KSh {formatPrice(totalAmount)}</span>
                  </div>
                  {cart.coupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount ({cart.coupon.coupon_code})</span>
                      <span>-KSh {formatPrice(cart.coupon.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span className="text-emerald-600">KSh {formatPrice(totalAmount - (cart.coupon ? parseFloat(cart.coupon.discount_amount) : 0))}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="/dashboard"
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-center font-medium transition-colors"
                >
                  Continue Shopping
                </a>
                <a
                  href="/checkout"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-center font-medium transition-colors"
                >
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;