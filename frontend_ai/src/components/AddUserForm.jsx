import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

const AddUserForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        is_staff: false,
        is_farmer: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        calculatePasswordStrength(formData.password);
    }, [formData.password]);

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

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength >= 75) return 'bg-green-500';
        if (passwordStrength >= 50) return 'bg-yellow-500';
        if (passwordStrength >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength >= 75) return 'Strong';
        if (passwordStrength >= 50) return 'Good';
        if (passwordStrength >= 25) return 'Weak';
        return 'Very Weak';
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
                is_staff: false,
                is_farmer: false
            });
            setPasswordStrength(0);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.detail ||
                     err.response?.data?.message ||
                     Object.entries(err.response?.data || {})
                         .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                         .join(', ') ||
                     'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.email && formData.password && formData.password.length >= 8;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create User Form */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                        <h2 className="text-2xl font-bold text-white">Create New User</h2>
                        <p className="text-blue-100 mt-1">Add a new user to the farmers market platform</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-fadeIn">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="text-sm text-red-700 mt-1">{error}</div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start animate-fadeIn">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Success!</h3>
                                    <div className="text-sm text-green-700 mt-1">{success}</div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., user@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="e.g., John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter a secure password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                
                                {/* Password Strength Meter */}
                                {formData.password && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>Password Strength:</span>
                                            <span className={`font-medium ${
                                                passwordStrength >= 75 ? 'text-green-600' :
                                                passwordStrength >= 50 ? 'text-yellow-600' :
                                                passwordStrength >= 25 ? 'text-orange-600' : 'text-red-600'
                                            }`}>
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                                style={{ width: `${passwordStrength}%` }}
                                            ></div>
                                        </div>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                            <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                                                • At least 8 characters
                                            </li>
                                            <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                                                • One uppercase letter
                                            </li>
                                            <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                                                • One number
                                            </li>
                                            <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                                                • One special character
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">
                                    User Roles
                                </label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="relative flex items-start p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_staff"
                                            checked={formData.is_staff}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-gray-700">Staff Member</span>
                                            <span className="block text-xs text-gray-500">Admin access to platform</span>
                                        </div>
                                    </label>

                                    <label className="relative flex items-start p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_farmer"
                                            checked={formData.is_farmer}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-medium text-gray-700">Farmer</span>
                                            <span className="block text-xs text-gray-500">Can sell products</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !isFormValid}
                                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                    isLoading || !isFormValid
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'
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
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6">
                        <h2 className="text-2xl font-bold text-white">Existing Users</h2>
                        <p className="text-gray-200 mt-1">{users.length} users in the system</p>
                    </div>

                    <div className="p-6">
                        {users.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                                <p className="text-gray-500">No users found</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {users.map((user, index) => (
                                    <div key={user.email} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                                {(user.full_name?.[0] || user.email[0]).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-800 truncate">
                                                {user.full_name || 'No Name'}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="ml-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.is_staff
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : user.is_farmer
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.is_staff ? 'Staff' : user.is_farmer ? 'Farmer' : 'User'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddUserForm;