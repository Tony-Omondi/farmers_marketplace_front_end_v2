import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

const AddProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        farmer: '',
        is_displayed: false,
        image_files: [],
    });
    const [categories, setCategories] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    throw new Error('No access token found. Please log in.');
                }

                // Fetch categories
                const categoryResponse = await axios.get(`${BASE_URL}/api/adamin/categories/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setCategories(categoryResponse.data);

                // Fetch farmers
                const farmerResponse = await axios.get(`${BASE_URL}/api/adamin/farmers/`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setFarmers(farmerResponse.data);
                if (farmerResponse.data.length === 0) {
                    setError('No farmers found. Please ensure farmers exist in the system.');
                }
            } catch (err) {
                console.error('Fetch data error:', err.response?.data || err.message);
                setError('Failed to load data: ' + (err.response?.data?.detail || err.message));
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = useCallback((files) => {
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') && 
            file.size <= 5 * 1024 * 1024
        );
        
        if (validFiles.length !== files.length) {
            setError('Some files were skipped. Only images under 5MB are allowed.');
        }
        
        setFormData(prev => ({ 
            ...prev, 
            image_files: [...prev.image_files, ...validFiles] 
        }));
    }, []);

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            image_files: prev.image_files.filter((_, i) => i !== index)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const simulateUploadProgress = (fileIndex) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            setUploadProgress(prev => ({
                ...prev,
                [fileIndex]: Math.min(progress, 100)
            }));
        }, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        setUploadProgress({});

        try {
            // Simulate upload progress for each file
            formData.image_files.forEach((_, index) => {
                simulateUploadProgress(index);
            });

            const form = new FormData();
            form.append('name', formData.name.trim());
            form.append('description', formData.description.trim());
            form.append('price', parseFloat(formData.price));
            form.append('stock', parseInt(formData.stock) || 0);
            if (formData.category) form.append('category', formData.category);
            if (formData.farmer) form.append('farmer', formData.farmer);
            form.append('is_displayed', formData.is_displayed);
            
            formData.image_files.forEach(file => {
                form.append('image_files', file);
            });

            const response = await axios.post(`${BASE_URL}/api/adamin/products/`, form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({
                        ...prev,
                        overall: progress
                    }));
                },
            });

            setSuccess('Product created successfully!');
            setFormData({ 
                name: '', 
                description: '', 
                price: '', 
                stock: '', 
                category: '', 
                farmer: '',
                is_displayed: false,
                image_files: [] 
            });
            setUploadProgress({});
        } catch (err) {
            console.error('Product creation error:', err.response?.data || err.message);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0] ||
                Object.entries(err.response?.data || {})
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join(', ') ||
                'Failed to create product: ' + err.message
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.name.trim() && formData.price && formData.stock;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                    <h2 className="text-2xl font-bold text-white">Add New Product</h2>
                    <p className="text-emerald-100 mt-1">Create a new product listing for your farmers market</p>
                </div>

                <div className="p-6">
                    {/* Status Messages */}
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

                    {/* Overall Upload Progress */}
                    {uploadProgress.overall > 0 && uploadProgress.overall < 100 && (
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Uploading product...</span>
                                <span>{uploadProgress.overall}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress.overall}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="e.g., Organic Avocados"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Farmer & Display Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="farmer" className="block text-sm font-semibold text-gray-700">
                                    Farmer
                                </label>
                                <select
                                    id="farmer"
                                    name="farmer"
                                    value={formData.farmer}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                >
                                    <option value="">Select Farmer</option>
                                    {farmers.length > 0 ? (
                                        farmers.map(farmer => (
                                            <option key={farmer.id} value={farmer.id}>
                                                {farmer.full_name || farmer.email}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No farmers available</option>
                                    )}
                                </select>
                            </div>

                            <div className="flex items-center space-x-4 pt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_displayed"
                                        checked={formData.is_displayed}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Display Only</span>
                                    <p className="text-xs text-gray-500">Product will be visible but not purchasable</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                                Product Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                                placeholder="Describe the product features, benefits, and specifications..."
                            />
                            <p className="text-xs text-gray-500">Character count: {formData.description.length}/500</p>
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                                    Price (KSh) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">KSh</span>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                    placeholder="Enter quantity"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700">
                                Product Images
                            </label>
                            
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                                    isDragging 
                                        ? 'border-emerald-500 bg-emerald-50 scale-105' 
                                        : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload').click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                
                                <div>
                                    <p className="text-lg font-medium text-gray-900 mb-1">
                                        Drop your images here, or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supports PNG, JPG, GIF • Max 5MB per image
                                    </p>
                                </div>
                            </div>
                            
                            {/* Image Previews */}
                            {formData.image_files.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Selected Images ({formData.image_files.length})
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {formData.image_files.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square rounded-xl overflow-hidden border border-gray-200">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {/* Upload Progress */}
                                                {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                                                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-white h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${uploadProgress[index]}%` }}
                                                        ></div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage(index);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                isLoading || !isFormValid
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-opacity-50'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Product...
                                </div>
                            ) : (
                                'Create Product'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductForm;