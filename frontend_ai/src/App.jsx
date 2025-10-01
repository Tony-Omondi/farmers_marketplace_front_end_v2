import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import PasswordResetRequest from './components/PasswordResetRequest';
import VerifyOTP from './components/VerifyOTP';
import Orders from './components/Orders';
import Payments from './components/Payments';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCallback from './components/PaymentCallback';
import AdaminLogin from './components/AdaminLogin';
import AdaminDashboard from './components/AdaminDashboard';
import AddCategoryForm from './components/AddCategoryForm';
import CreateOrderForm from './components/CreateOrderForm';
import AddProductForm from './components/AddProductForm';
import AdminOrderDetails from './components/AdminOrderDetails';
import AddUserForm from './components/AddUserForm';
import FarmerSales from './components/FarmerSales';
import EditProductForm from './components/EditProductForm';
import AdminPaymentSuccess from './components/AdminPaymentSuccess';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<PasswordResetRequest />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* User routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-callback" element={<PaymentCallback />} />

      {/* Admin routes (intentionally using /adamin/) */}
      <Route path="/adamin/login" element={<AdaminLogin />} />
      <Route path="/adamin/dashboard" element={<AdaminDashboard />} />
      <Route path="/adamin/add-category" element={<AddCategoryForm />} />
      <Route path="/adamin/add-product" element={<AddProductForm />} />
      <Route path="/adamin/farmer-sales" element={<FarmerSales />} />
      <Route path="/adamin/edit-product/:id" element={<EditProductForm />} />
      <Route path="/adamin/create-order" element={<CreateOrderForm />} />
      <Route path="/adamin/payment-success" element={<AdminPaymentSuccess />} />
      <Route path="/adamin/add-user" element={<AddUserForm />} />
      <Route path="/adamin/orders/:orderId" element={<AdminOrderDetails />} />
    </Routes>
  );
}

export default App;
