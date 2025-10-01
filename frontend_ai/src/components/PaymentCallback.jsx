import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

const PaymentCallback = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference');
      if (!reference) {
        setError('No payment reference provided.');
        setTimeout(() => navigate('/admin/carts?refresh=true'), 3000);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Please log in to verify payment.');
          navigate('/login');
          return;
        }

        // Check if user is admin
        let isAdmin = false;
        try {
          const userResponse = await axios.get(`${BASE_URL}/api/accounts/profile/`, {
            headers: { Authorization: `Bearer ${token.trim()}` },
          });
          isAdmin = userResponse.data.is_staff;
        } catch (err) {
          console.error('Profile fetch error:', err.response?.data || err.message);
          // Continue with payment verification even if profile fetch fails
        }

        const response = await axios.get(`${BASE_URL}/api/orders/orders/payment/callback/`, {
          headers: { Authorization: `Bearer ${token.trim()}` },
          params: { reference },
        });

        if (response.data.status) {
          // Fetch the order to get its pk (id)
          const orderResponse = await axios.get(`${BASE_URL}/api/orders/orders/`, {
            headers: { Authorization: `Bearer ${token.trim()}` },
            params: { order_id: response.data.order_id },
          });
          const order = orderResponse.data.find((o) => o.order_id === response.data.order_id);
          if (order) {
            navigate(isAdmin ? '/admin/payment-success' : '/payment-success', { state: { orderId: order.id } });
          } else {
            setError('Order not found.');
            setTimeout(() => navigate(isAdmin ? '/admin/carts?refresh=true' : '/cart'), 3000);
          }
        } else {
          setError(response.data.message || 'Payment verification failed.');
          setTimeout(() => navigate(isAdmin ? '/admin/carts?refresh=true' : '/cart'), 3000);
        }
      } catch (err) {
        console.error('Payment callback error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to verify payment.');
        setTimeout(() => navigate(isAdmin ? '/admin/carts?refresh=true' : '/cart'), 3000);
      }
    };

    checkPaymentStatus();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-600">Verifying payment...</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
            <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;