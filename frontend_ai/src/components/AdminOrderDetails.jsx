import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-ez1j.onrender.com';

const AdminOrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    navigate('/adamin/login');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/api/adamin/orders/${orderId}/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                console.log('Order details:', response.data);
                setOrder(response.data);
            } catch (err) {
                console.error('Order details error:', err.response?.data);
                setError(err.response?.data?.detail || 'Failed to load order details');
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    navigate('/adamin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, navigate]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
                    Order not found
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Items - #{order.order_id}</h1>
                    <button
                        onClick={() => navigate('/adamin')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
                        {order.order_items && order.order_items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-600">
                                            <th className="p-3">Product</th>
                                            <th className="p-3">Quantity</th>
                                            <th className="p-3">Price</th>
                                            <th className="p-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.order_items.map(item => (
                                            <tr key={item.product.id} className="border-t hover:bg-gray-50">
                                                <td className="p-3 flex items-center">
                                                    {item.product.images && item.product.images.length > 0 ? (
                                                        <img
                                                            src={item.product.images[0].image}
                                                            alt={item.product.name || 'Product'}
                                                            className="w-12 h-12 object-cover rounded mr-3"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <span>{item.product.name || 'Unknown Product'}</span>
                                                </td>
                                                <td className="p-3">{item.quantity}</td>
                                                <td className="p-3">${item.product_price}</td>
                                                <td className="p-3">${(item.quantity * item.product_price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-gray-500">No items in this order</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;