import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const AddUserForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        is_staff: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/adamin/users/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post(`${BASE_URL}/api/adamin/users/create/`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            setSuccess('User created successfully!');
            setFormData({
                email: '',
                full_name: '',
                password: '',
                is_staff: false
            });
            fetchUsers(); // Refresh the users list
        } catch (err) {
            setError(err.response?.data?.detail ||
                     err.response?.data?.message ||
                     'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New User</h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>{error}</div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start">
                        <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>{success}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="e.g., user@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="e.g., John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="Enter a secure password"
                            required
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="is_staff"
                            name="is_staff"
                            type="checkbox"
                            checked={formData.is_staff}
                            onChange={handleChange}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-700">
                            Is Staff (Admin)
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            isLoading
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating User...
                            </div>
                        ) : (
                            'Create User'
                        )}
                    </button>
                </form>
            </div>

            {/* Existing Users */}
            {users.length > 0 && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Users</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map(user => (
                            <div key={user.email} className="border rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium">{user.full_name || 'No Name'}</h4>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.is_staff
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.is_staff ? 'Staff' : 'Regular User'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddUserForm;