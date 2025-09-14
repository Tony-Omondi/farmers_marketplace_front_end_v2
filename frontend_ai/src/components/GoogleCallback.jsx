import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('https://farmers-marketplace-ez1j.onrender.com/api/auth/google/callback/', {
          withCredentials: true,
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } catch (err) {
        console.error('Google login failed:', err);
        navigate('/login', { state: { error: 'Google login failed. Please try again.' } });
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Processing Google login...</p>
    </div>
  );
};

export default GoogleCallback;