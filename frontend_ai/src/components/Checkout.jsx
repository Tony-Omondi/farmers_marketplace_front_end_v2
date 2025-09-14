import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-ez1j.onrender.com';

// Fallback product image
const FALLBACK_IMAGE = 'https://www.flaticon.com/free-icon/crate_4478164?term=farmer+market&page=1&position=11&origin=tag&related_id=4478164';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Format price helper
  const formatPrice = useCallback((price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  }, []);

  // Get auth token helper
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to proceed to checkout.');
      navigate('/login');
      return null;
    }
    return token.trim();
  }, [navigate]);

  // Fetch product details
  const fetchProductDetails = useCallback(async (token, productIds) => {
    try {
      const productsResponse = await axios.get(`${BASE_URL}/api/products/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: productIds.join(',') },
      });
      
      return productsResponse.data.reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
    } catch (err) {
      console.error('Fetch products error:', err.response?.data || err.message);
      throw new Error('Failed to load product details');
    }
  }, []);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      setIsLoading(true);
      setError('');
      
      const cartResponse = await axios.get(`${BASE_URL}/api/orders/carts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const cartData = cartResponse.data[0] || null;
      setCart(cartData);

      if (cartData?.cart_items?.length > 0) {
        const productIds = cartData.cart_items
          .map(item => typeof item.product === 'number' ? item.product : item.product.id)
          .filter(id => id && !products[id]); // Only fetch products not already in state

        if (productIds.length > 0) {
          const productMap = await fetchProductDetails(token, productIds);
          setProducts(prev => ({ ...prev, ...productMap }));
        }
      }
    } catch (err) {
      console.error('Fetch cart error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load cart. Please try again.';
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, getAuthToken, fetchProductDetails, products]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Get product from cart item
  const getProductFromItem = useCallback((item) => {
    if (typeof item.product === 'object') {
      return item.product;
    }
    return products[item.product] || null;
  }, [products]);

  // Get product image with fallback
  const getProductImage = useCallback((product) => {
    if (product?.images?.length > 0) {
      return `${BASE_URL}${product.images[0].image}`;
    }
    return FALLBACK_IMAGE;
  }, []);

  // Calculate fallback total
  const calculateFallbackTotal = useCallback(() => {
    if (!cart?.cart_items) return 0;
    
    return cart.cart_items.reduce((sum, item) => {
      const product = getProductFromItem(item);
      const price = product ? parseFloat(product.price) : 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart, getProductFromItem]);

  // Initiate payment
  const initiatePayment = async () => {
    if (isPaying) return;
    
    setIsPaying(true);
    setError('');
    
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.post(
        `${BASE_URL}/api/orders/orders/payment/initiate/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setError(response.data.message || 'Failed to initiate payment.');
      }
    } catch (err) {
      console.error('Payment initiation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && (!cart || !cart.cart_items || cart.cart_items.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="max-w-md p-4">
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Checkout</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {!cart || !cart.cart_items || cart.cart_items.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.cart_items.map((item) => {
                const product = getProductFromItem(item);
                const productImage = getProductImage(product);
                
                return (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-200 py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={productImage}
                          alt={product?.name || 'Product'}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-600">
                          KSh {formatPrice(product?.price || 0)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      KSh {formatPrice((product?.price || 0) * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-800 font-medium">Subtotal</p>
              <p className="text-gray-600">
                KSh {formatPrice(cart.total_amount || calculateFallbackTotal())}
              </p>
            </div>
            
            {cart.coupon && (
              <div className="flex justify-between items-center mb-4 text-emerald-600">
                <p className="font-medium">Coupon Discount ({cart.coupon.coupon_code})</p>
                <p className="font-medium">-KSh {formatPrice(cart.coupon.discount || 0)}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-6">
              <p className="text-lg font-bold text-gray-800">Total</p>
              <p className="text-lg font-bold text-gray-800">
                KSh {formatPrice(
                  (cart.total_amount || calculateFallbackTotal()) - 
                  (cart.coupon ? parseFloat(cart.coupon.discount || 0) : 0)
                )}
              </p>
            </div>
            
            <button
              onClick={initiatePayment}
              disabled={isPaying}
              className={`w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors ${
                isPaying ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isPaying ? 'Processing Payment...' : `Pay KSh ${formatPrice(
                (cart.total_amount || calculateFallbackTotal()) - 
                (cart.coupon ? parseFloat(cart.coupon.discount || 0) : 0)
              )} with Paystack`}
            </button>
          </div>
        )}
        
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;