// frontend_ai/src/components/AddCategoryForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-ez1j.onrender.com';

const AddCategoryForm = () => {
    const [formData, setFormData] = useState({ 
        name: '', 
        slug: '',
        description: '',
        is_active: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/adamin/categories/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
        
        // Auto-generate slug from name
        if (name === 'name') {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
                .replace(/\s+/g, '-')        // Replace spaces with -
                .replace(/-+/g, '-');        // Replace multiple - with single -
            
            setFormData(prev => ({ 
                ...prev, 
                name: value,
                slug: prev.slug || generatedSlug 
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        
        try {
            await axios.post(`${BASE_URL}/api/adamin/categories/create/`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            setSuccess('Category created successfully!');
            setFormData({ 
                name: '', 
                slug: '',
                description: '',
                is_active: true
            });
            fetchCategories(); // Refresh the categories list
        } catch (err) {
            setError(err.response?.data?.detail || 
                     err.response?.data?.message || 
                     'Failed to create category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSlugEdit = (e) => {
        // Only update slug if user manually edits it
        setFormData({ ...formData, slug: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Category</h2>
                
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="e.g., Electronics, Clothing, Books"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            Slug *
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleSlugEdit}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="e.g., electronics, clothing, books"
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            URL-friendly version of the name. Use only lowercase letters, numbers, and hyphens.
                        </p>
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="Brief description of this category..."
                        />
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                            Category is active
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
                                Creating Category...
                            </div>
                        ) : (
                            'Create Category'
                        )}
                    </button>
                </form>
            </div>
            
            {/* Existing Categories */}
            {categories.length > 0 && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Categories</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(category => (
                            <div key={category.id} className="border rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium">{category.name}</h4>
                                    <p className="text-sm text-gray-500">{category.slug}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        category.is_active 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {category.product_count || 0} products
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCategoryForm;