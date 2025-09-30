import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

const FarmerSales = ({ filterDateRange, customStartDate, customEndDate, searchQuery }) => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/adamin/login');
          return;
        }

        // Construct query parameters for date filtering
        const params = new URLSearchParams();
        if (filterDateRange !== 'all') {
          if (filterDateRange === 'custom' && customStartDate && customEndDate) {
            params.append('start_date', customStartDate);
            params.append('end_date', customEndDate);
          } else {
            const now = new Date();
            let startDate;
            switch (filterDateRange) {
              case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
                params.append('start_date', startDate);
                break;
              case 'yesterday':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                startDate = startDate.toISOString().split('T')[0];
                params.append('start_date', startDate);
                params.append('end_date', startDate);
                break;
              case 'last7':
                startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
                params.append('start_date', startDate);
                break;
              case 'last30':
                startDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
                params.append('start_date', startDate);
                break;
              default:
                break;
            }
          }
        }

        const response = await axios.get(`${BASE_URL}/api/adamin/farmers/sales/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params
        });
        console.log('Farmer sales data:', response.data);
        setSalesData(response.data);
      } catch (err) {
        console.error('Farmer sales error:', err.response?.data);
        setError(err.response?.data?.detail || 'Failed to load farmer sales data');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/adamin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalesData();
  }, [navigate, filterDateRange, customStartDate, customEndDate]);

  const filterDataBySearch = (items) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(farmer =>
      farmer.full_name.toLowerCase().includes(query) ||
      farmer.email.toLowerCase().includes(query)
    );
  };

  const filteredSalesData = filterDataBySearch(salesData);

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Farmer Sales</h2>
        <span className="text-gray-500">{filteredSalesData.length} farmers</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Farmer Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Total Sales (KSh)</th>
                <th className="p-3">Order Count</th>
                <th className="p-3">Last Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesData.map(farmer => (
                <tr key={farmer.farmer_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{farmer.full_name}</td>
                  <td className="p-3">{farmer.email}</td>
                  <td className="p-3">{parseFloat(farmer.total_sales).toFixed(2)}</td>
                  <td className="p-3">{farmer.order_count}</td>
                  <td className="p-3">
                    {new Date(farmer.last_sale_date).toLocaleDateString('en-US', { timeZone: 'Africa/Nairobi' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FarmerSales;