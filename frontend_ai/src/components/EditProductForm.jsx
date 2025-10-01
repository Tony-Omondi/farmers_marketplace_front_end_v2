import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

const EditProductForm = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    farmer: '',
    is_displayed: false,
    images: []
  });
  const [categories, setCategories] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!productId || isNaN(productId)) {
        setError('Invalid product ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/adamin/login');
          return;
        }

        // Fetch product details
        const productResponse = await axios.get(`${BASE_URL}/api/products/${productId}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setProduct({
          name: productResponse.data.name,
          description: productResponse.data.description || '',
          price: productResponse.data.price,
          stock: productResponse.data.stock,
          category: productResponse.data.category || '',
          farmer: productResponse.data.farmer || '',
          is_displayed: productResponse.data.is_displayed,
          images: productResponse.data.images || []
        });

        // Fetch categories
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setCategories(categoriesResponse.data);

        // Fetch farmers
        const farmersResponse = await axios.get(`${BASE_URL}/api/adamin/farmers/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setFarmers(farmersResponse.data);
      } catch (err) {
        console.error('Error fetching product data:', err.response?.data);
        setError(err.response?.data?.detail || 'Failed to load product data');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/adamin/login');
        } else if (err.response?.status === 404) {
          setError('Product not found');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate, productId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      await axios.post(
        `${BASE_URL}/api/products/${productId}/delete-image/`,
        { image_id: imageId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId)
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('price', product.price);
      formData.append('stock', product.stock);
      if (product.category) formData.append('category', product.category);
      if (product.farmer) formData.append('farmer', product.farmer);
      formData.append('is_displayed', product.is_displayed);
      newImages.forEach((image) => formData.append('image_files', image));

      const response = await axios.patch(
        `${BASE_URL}/api/products/${productId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log('Product updated:', response.data);
      navigate('/adamin/dashboard');
    } catch (err) {
      console.error('Error updating product:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to update product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <p>{error}</p>
          <button
            onClick={() => navigate('/adamin/dashboard')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows="4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleInputChange}
            min="0"
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Farmer</label>
          <select
            name="farmer"
            value={product.farmer}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Farmer</option>
            {farmers.map((farmer) => (
              <option key={farmer.id} value={farmer.id}>
                {farmer.full_name} ({farmer.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_displayed"
              checked={product.is_displayed}
              onChange={handleInputChange}
              className="h-4 w-4 text-emerald-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Is Displayed (visible but non-clickable on frontend)
            </span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          {product.images.map((image) => (
            <div key={image.id} className="flex items-center space-x-4 mt-2">
              <img src={image.image} alt="Product" className="w-24 h-24 object-cover rounded" />
              <div>
                <p className="text-sm text-gray-500">Currently: {image.image.split('/').pop()}</p>
                <button
                  type="button"
                  onClick={() => handleDeleteImage(image.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Add New Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate('/adamin/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;