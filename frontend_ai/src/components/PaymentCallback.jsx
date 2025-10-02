import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

// Configure Axios retries
axiosRetry(axios, { retries: 3, retryDelay: (retryCount) => retryCount * 1000 });

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
        setTimeout(() => navigate('/adamin/carts?refresh=true'), 3000);
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to verify payment.');
        navigate('/login');
        return;
      }

      // Validate token
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
      } catch (err) {
        setError('Invalid token. Please log in again.');
        navigate('/login');
        return;
      }

      let isAdmin = false;

      try {
        console.log('Starting API calls for reference:', reference);

        // Fetch user and payment verification together
        const [userResponse, paymentResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/accounts/me/`, {
            headers: { Authorization: `Bearer ${token.trim()}` },
            timeout: 10000,
          }).catch(() => ({ data: { is_staff: false } })), // fallback if profile fails

          axios.get(`${BASE_URL}/api/orders/orders/payment/callback/`, {
            headers: { Authorization: `Bearer ${token.trim()}` },
            params: { reference },
            timeout: 10000,
          }),
        ]);

        console.log('Payment response:', paymentResponse.data);

        isAdmin = userResponse.data.is_staff;
        const paymentData = paymentResponse.data;

        if (paymentData.status) {
          // ✅ Redirect directly with order.id from backend response
          navigate(
            isAdmin ? '/adamin/payment-success' : '/payment-success',
            { state: { orderId: paymentData.id } }
          );
          return;
        } else {
          setError(paymentData.message || 'Payment verification failed.');
        }
      } catch (err) {
        console.error('Payment callback error:', err.response?.data || err.message);
        const errorMessage = err.response?.status === 401
          ? 'Authentication failed. Please log in again.'
          : err.response?.status === 404
            ? 'API endpoint not found. Please contact support.'
            : err.code === 'ERR_NETWORK'
              ? 'Network error. Please check your connection or try again later.'
              : err.response?.data?.message || 'Failed to verify payment. Please try again.';
        setError(errorMessage);
      }

      // fallback if something fails
      const fallbackPath = isAdmin ? '/adamin/carts?refresh=true' : '/cart';
      setTimeout(() => navigate(fallbackPath), 3000);
    };

    checkPaymentStatus();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-600">Verifying payment, please wait... This may take a few seconds.</p>
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
