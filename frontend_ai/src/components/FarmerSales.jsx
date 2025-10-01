import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'https://farmers-marketplace-backend-v2.onrender.com';

const FarmerSales = ({ filterDateRange, customStartDate, customEndDate, searchQuery }) => {
  const [salesData, setSalesData] = useState({
    past_day: [],
    past_week: [],
    past_month: [],
    past_year: [],
    custom: []
  });
  const [activePeriod, setActivePeriod] = useState(filterDateRange === 'custom' ? 'custom' : 'past_year');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'total_sales', direction: 'descending' });
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

        const params = new URLSearchParams();
        if (filterDateRange !== 'all' && filterDateRange === 'custom' && customStartDate && customEndDate) {
          params.append('start_date', customStartDate);
          params.append('end_date', customEndDate);
        } else if (filterDateRange !== 'all') {
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

        const response = await axios.get(`${BASE_URL}/api/adamin/farmers/sales/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params
        });
        
        setSalesData(response.data);
        setActivePeriod(filterDateRange === 'custom' ? 'custom' : 'past_year');
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

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const filterDataBySearch = (items) => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(farmer =>
      farmer.full_name?.toLowerCase().includes(query) ||
      farmer.email?.toLowerCase().includes(query)
    );
  };

  const sortData = (items) => {
    if (!sortConfig.key) return items;
    
    return [...items].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'ascending') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const getSortedData = () => {
    const filtered = filterDataBySearch(salesData[activePeriod] || []);
    return sortData(filtered);
  };

  const periods = [
    { id: 'past_year', label: 'Past Year', icon: '📅' },
    { id: 'past_month', label: 'Past Month', icon: '📆' },
    { id: 'past_week', label: 'Past Week', icon: '🗓️' },
    { id: 'past_day', label: 'Past Day', icon: '📊' },
    ...(filterDateRange === 'custom' && customStartDate && customEndDate ? 
      [{ id: 'custom', label: 'Custom Range', icon: '⏰' }] : [])
  ];

  const SortIcon = ({ direction }) => (
    <svg 
      className={`w-4 h-4 ml-1 transition-transform ${direction === 'ascending' ? 'rotate-180' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );

  const totalSales = getSortedData().reduce((sum, farmer) => sum + parseFloat(farmer.total_sales || 0), 0);
  const totalOrders = getSortedData().reduce((sum, farmer) => sum + parseInt(farmer.order_count || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Farmer Sales Analytics</h2>
          <p className="text-gray-500 mt-1">Track sales performance across different time periods</p>
        </div>
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-xl font-bold text-emerald-600">KSh {totalSales.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-blue-600">{totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center animate-fadeIn">
          <svg className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={() => setError('')}
            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}

      {/* Period Tabs */}
      <div className="mb-6">
        <div className="flex overflow-x-auto space-x-1 bg-gray-100 p-1 rounded-lg">
          {periods.map(period => (
            <button
              key={period.id}
              className={`flex items-center gap-2 py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md transition-all duration-200 ${
                activePeriod === period.id
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-white'
              }`}
              onClick={() => setActivePeriod(period.id)}
            >
              <span>{period.icon}</span>
              <span>{period.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Farmers</p>
              <p className="text-xl font-bold text-gray-800">{getSortedData().length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Sales/Farmer</p>
              <p className="text-xl font-bold text-gray-800">
                KSh {getSortedData().length > 0 ? (totalSales / getSortedData().length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Orders/Farmer</p>
              <p className="text-xl font-bold text-gray-800">
                {getSortedData().length > 0 ? (totalOrders / getSortedData().length).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Loading farmer sales data...</p>
        </div>
      ) : getSortedData().length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-gray-500 text-lg mb-2">No sales data found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery 
              ? `No farmers match your search for "${searchQuery}"` 
              : 'No sales data available for the selected period'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'full_name', label: 'Farmer Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'total_sales', label: 'Total Sales (KSh)' },
                    { key: 'order_count', label: 'Order Count' },
                    { key: 'last_sale_date', label: 'Last Sale' }
                  ].map(({ key, label }) => (
                    <th 
                      key={key}
                      className="p-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center">
                        {label}
                        <SortIcon direction={sortConfig.key === key ? sortConfig.direction : null} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getSortedData().map((farmer, index) => (
                  <tr 
                    key={farmer.farmer_id} 
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                          {(farmer.full_name?.[0] || 'F').toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">
                          {farmer.full_name || 'Unknown Farmer'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{farmer.email || 'N/A'}</td>
                    <td className="p-4">
                      <span className="font-semibold text-emerald-600">
                        KSh {parseFloat(farmer.total_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {farmer.order_count || 0} orders
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {farmer.last_sale_date
                        ? new Date(farmer.last_sale_date).toLocaleDateString('en-US', { 
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'Africa/Nairobi'
                          })
                        : 'No sales yet'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {getSortedData().length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>Showing {getSortedData().length} farmers</span>
          <span>Sorted by {sortConfig.key.replace('_', ' ')} ({sortConfig.direction})</span>
        </div>
      )}
    </div>
  );
};

export default FarmerSales;