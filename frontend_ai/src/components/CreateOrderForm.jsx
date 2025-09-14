// frontend_ai/src/components/CreateOrderForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-ez1j.onrender.com';

const CreateOrderForm = () => {
    const [formData, setFormData] = useState({
        user_email: '',
        payment_mode: 'mpesa',
        coupon_code: '',
        items: [{ product_id: '', quantity: '' }],
    });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, productsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/adamin/users/`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    }),
                    axios.get(`${BASE_URL}/api/adamin/products/`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    }),
                ]);
                setUsers(usersRes.data);
                setProducts(productsRes.data);
            } catch (err) {
                setError('Failed to load users or products');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e, index = null) => {
        if (index !== null) {
            const items = [...formData.items];
            items[index][e.target.name] = e.target.value;
            setFormData({ ...formData, items });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product_id: '', quantity: '' }],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            await axios.post(`${BASE_URL}/api/adamin/orders/create/`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            setSuccess('Order created successfully!');
            setFormData({
                user_email: '',
                payment_mode: 'mpesa',
                coupon_code: '',
                items: [{ product_id: '', quantity: '' }],
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order');
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Create Order</h2>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">User Email</label>
                    <select
                        name="user_email"
                        value={formData.user_email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user.email} value={user.email}>{user.email}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <select
                        name="payment_mode"
                        value={formData.payment_mode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                    >
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Card</option>
                        <option value="bank">Bank Transfer</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">For cash payments, please instruct the user to use M-Pesa.</p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                    <input
                        type="text"
                        name="coupon_code"
                        value={formData.coupon_code}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Order Items</h3>
                    {formData.items.map((item, index) => (
                        <div key={index} className="flex space-x-4 mb-2">
                            <select
                                name="product_id"
                                value={item.product_id}
                                onChange={e => handleChange(e, index)}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                name="quantity"
                                value={item.quantity}
                                onChange={e => handleChange(e, index)}
                                className="w-24 px-3 py-2 border rounded-lg"
                                min="1"
                                required
                            />
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Add Item
                    </button>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Create Order
                </button>
            </form>
        </div>
    );
};

export default CreateOrderForm;