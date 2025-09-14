
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/AddCategoryForm" element={<AddCategoryForm />} />
      <Route path="/AddProductForm" element={<AddProductForm />} />
      <Route path="/CreateOrderForm" element={<CreateOrderForm />} />
      <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<PasswordResetRequest />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-callback" element={<PaymentCallback />} />
      <Route path="/adamin/login" element={<AdaminLogin />} />
      <Route path="/adamin/dashboard" element={<AdaminDashboard />} />
    </Routes>
  );
}

export default App;
